"""Stage 3 and 4: validate and normalise one mapped row. Pure functions, no database.

Each validator returns a Row (possibly carrying flags) or a Reject. Exclusions are checked first so an
excluded operator is always rejected with `excluded_operator`, whatever else is wrong with the row.
"""

from __future__ import annotations

import re
from datetime import date

from .config import IngestConfig
from .normalize import (
    clean,
    excluded_match,
    fold,
    is_us_tail,
    is_valid_icao,
    is_valid_tail_chars,
    normalize_category,
    normalize_certificate,
    normalize_certificate_type,
    normalize_email,
    normalize_icao,
    normalize_phone,
    normalize_rating,
    normalize_tail,
    parse_bool,
    parse_float,
    parse_int,
)
from .types import Flag, Reject, Row, ValidationContext

Raw = dict[str, str | None]

EXCLUDED = "excluded_operator"


def _opname_cert(cert: str) -> str:
    from ..opname import normalize_certificate as _nc

    return _nc(cert)


def _too_long(values: dict[str, str | None], limits: dict[str, int]) -> str | None:
    for f, limit in limits.items():
        v = values.get(f)
        if v is not None and len(v) > limit:
            return f
    return None


def _int_field(raw: Raw, name: str, lo: int, hi: int, n: int, flags: list[Flag]) -> int | None:
    s = raw.get(name)
    if s is None:
        return None
    v = parse_int(s)
    if v is None or not (lo <= v <= hi):
        flags.append(Flag(n, f"invalid_{name}", f"{name} is not a whole number in {lo}-{hi}; left empty"))
        return None
    return v


def _state(raw: Raw, n: int, flags: list[Flag]) -> str | None:
    s = raw.get("state")
    if s is None:
        return None
    if re.fullmatch(r"[A-Za-z]{2}", s):
        return s.upper()
    flags.append(Flag(n, "invalid_state", "state is not a 2-letter code; left empty"))
    return None


# ----------------------------------------------------------------------------- operators
def validate_operator(n: int, raw: Raw, cfg: IngestConfig, ctx: ValidationContext) -> Row | Reject:
    dba_raw, legal = raw.get("dba_name"), raw.get("legal_name")
    cert = normalize_certificate(raw.get("certificate_number"))

    if cert and _opname_cert(cert) in cfg.excluded_certificates:  # excluded by certificate number (config)
        ctx.excluded_certs.add(cert)
        return Reject(n, EXCLUDED, "operator certificate is on the exclusion list")

    for name in (dba_raw, legal):
        if excluded_match(name, cfg.excluded):
            if cert:
                ctx.excluded_certs.add(cert)
            has_contact = any(raw.get(k) for k in ("contact_name", "contact_email", "contact_phone"))
            return Reject(
                n,
                EXCLUDED,
                "operator matches the exclusion list" + ("; its contact rejected too" if has_contact else ""),
            )

    flags: list[Flag] = []
    dba = None
    for name in (dba_raw, legal):
        if name and fold(name) in cfg.dba_overrides:
            dba = cfg.dba_overrides[fold(name)]
            break
    dba = dba or dba_raw
    if not dba:
        return Reject(n, "missing_required:dba_name", "no DBA name and no override for the legal name")
    if excluded_match(dba, cfg.excluded):  # an override must not smuggle an excluded name in
        if cert:
            ctx.excluded_certs.add(cert)
        return Reject(n, EXCLUDED, "operator matches the exclusion list")

    if cert is None:
        flags.append(Flag(n, "no_certificate_number", "deduped by DBA name only"))

    cert_type = normalize_certificate_type(raw.get("certificate_type"))
    if raw.get("certificate_type") is None:
        flags.append(Flag(n, "certificate_type_missing", "defaulted to 135 by the schema; confirm"))
    elif cert_type is None:
        flags.append(Flag(n, "certificate_type_unrecognized", "defaulted to 135 by the schema; confirm"))

    rating, known = normalize_rating(raw.get("safety_rating"), cfg.rating_source_tokens, cfg.rating_aliases)
    if not known:
        flags.append(Flag(n, "unknown_rating", "rating value not recognised; stored as Not rated"))

    base = normalize_icao(raw.get("base_airport_icao"))
    if base and not is_valid_icao(base):
        flags.append(Flag(n, "invalid_icao", "base airport code is not a 4-letter ICAO; left empty"))
        base = None

    country = raw.get("country")
    if country is not None:
        if re.fullmatch(r"[A-Za-z]{2}", country):
            country = country.upper()
        else:
            flags.append(Flag(n, "invalid_country", "country is not a 2-letter code; left empty"))
            country = None
    if cert_type == "foreign" and country is None:
        flags.append(Flag(n, "foreign_operator_country_missing", "foreign certificate with no country"))

    contacts = []
    email, ok = normalize_email(raw.get("contact_email"))
    if not ok:
        flags.append(
            Flag(n, "invalid_contact_email", "contact email failed syntax validation; contact not loaded")
        )
    phone, parsed = normalize_phone(raw.get("contact_phone"))
    if phone and not parsed:
        flags.append(Flag(n, "phone_not_e164", "phone kept as supplied; not unambiguous"))
    if email:
        rfq = parse_bool(raw.get("receives_rfq"))
        contacts.append(
            {
                "name": raw.get("contact_name"),
                "title": raw.get("contact_title"),
                "email": email,
                "phone": phone,
                "receives_rfq": True if rfq is None else rfq,
            }
        )
    elif ok and (raw.get("contact_name") or phone):
        flags.append(Flag(n, "contact_without_email", "contact has no email; not loaded"))

    data = {
        "dba_name": dba,
        "legal_name": legal,
        "certificate_number": cert,
        "certificate_type": cert_type,
        "safety_rating": rating,
        "base_airport_icao": base,
        "country": country,
        "contacts": contacts,
    }
    bad = _too_long(data, {"dba_name": 200, "legal_name": 200, "certificate_number": 32, "country": 2})
    if bad:
        return Reject(n, f"value_too_long:{bad}")
    for c in contacts:
        bad = _too_long(c, {"name": 200, "title": 120, "email": 320, "phone": 40})
        if bad:
            return Reject(n, f"value_too_long:contact_{bad}")
    return Row(n, data, flags)


# ----------------------------------------------------------------------------- aircraft
def validate_aircraft(n: int, raw: Raw, cfg: IngestConfig, ctx: ValidationContext) -> Row | Reject:
    op_name = raw.get("operator_name")
    op_cert = normalize_certificate(raw.get("operator_certificate_number"))
    if (excluded_match(op_name, cfg.excluded) or (op_cert and op_cert in ctx.excluded_certs)
            or (op_cert and _opname_cert(op_cert) in cfg.excluded_certificates)):
        return Reject(n, EXCLUDED, "aircraft belongs to an excluded operator")

    flags: list[Flag] = []
    tail = normalize_tail(raw.get("tail_number"))
    if not tail:
        return Reject(n, "missing_required:tail_number")
    if not is_valid_tail_chars(tail):
        return Reject(n, "invalid_tail", "tail number has invalid characters or length")
    if not is_us_tail(tail):
        flags.append(Flag(n, "non_us_tail", "not a US N-number format; needs review"))

    if not op_cert and not op_name:
        return Reject(
            n, "missing_required:operator", "row has neither operator certificate nor operator name"
        )
    if not raw.get("manufacturer"):
        return Reject(n, "missing_required:manufacturer")
    if not raw.get("model"):
        return Reject(n, "missing_required:model")

    category = normalize_category(raw.get("category"))
    if raw.get("category") and category is None:
        flags.append(Flag(n, "invalid_category", "category not recognised; ignored"))

    icao_type = raw.get("icao_type_code")
    if icao_type:
        icao_type = icao_type.upper()
        if not re.fullmatch(r"[A-Z0-9]{2,4}", icao_type):
            flags.append(Flag(n, "invalid_icao_type_code", "ICAO type code ignored"))
            icao_type = None

    year_max = date.today().year + 2
    home = normalize_icao(raw.get("home_airport_icao"))
    if home and not is_valid_icao(home):
        flags.append(Flag(n, "invalid_icao", "home airport code is not a 4-letter ICAO; left empty"))
        home = None

    amen = raw.get("amenities")
    amenities = [a.strip() for a in re.split(r"[;,|]", amen) if a.strip()] if amen else None

    data = {
        "tail_number": tail,
        "operator_certificate_number": op_cert,
        "operator_name": op_name,
        "manufacturer": raw["manufacturer"],
        "model": raw["model"],
        "category": category,
        "icao_type_code": icao_type,
        "year_of_manufacture": _int_field(raw, "year_of_manufacture", 1900, year_max, n, flags),
        "year_refurbished": _int_field(raw, "year_refurbished", 1900, year_max, n, flags),
        "passenger_seats": _int_field(raw, "passenger_seats", 1, 600, n, flags),
        "home_airport_icao": home,
        "amenities": amenities or None,
    }
    bad = _too_long(
        data, {"manufacturer": 80, "model": 80, "operator_name": 200, "operator_certificate_number": 32}
    )
    if bad:
        return Reject(n, f"value_too_long:{bad}")
    return Row(n, data, flags)


# ----------------------------------------------------------------------------- airports and FBOs
_US_ICAO_PREFIXES = ("K", "PA", "PH", "PG", "PW", "PM", "PO", "PF", "TJ", "TI")


def validate_airport(n: int, raw: Raw, cfg: IngestConfig, ctx: ValidationContext) -> Row | Reject:
    flags: list[Flag] = []
    icao = normalize_icao(raw.get("icao"))
    if not icao:
        return Reject(n, "missing_required:icao")
    if not is_valid_icao(icao):
        return Reject(n, "invalid_icao", "ICAO code must be 4 letters")
    for f in ("name", "latitude", "longitude"):
        if not raw.get(f):
            return Reject(n, f"missing_required:{f}")
    lat, lon = parse_float(raw["latitude"]), parse_float(raw["longitude"])
    if lat is None or not -90 <= lat <= 90:
        return Reject(n, "invalid_latitude")
    if lon is None or not -180 <= lon <= 180:
        return Reject(n, "invalid_longitude")

    iata = raw.get("iata")
    if iata:
        iata = iata.upper()
        if not re.fullmatch(r"[A-Z]{3}", iata):
            flags.append(Flag(n, "invalid_iata", "IATA code ignored"))
            iata = None
    country = raw.get("country")
    if country and re.fullmatch(r"[A-Za-z]{2}", country):
        country = country.upper()
    else:
        if country:
            flags.append(Flag(n, "invalid_country", "country is not a 2-letter code; left empty"))
        country = None
        if not icao.startswith(_US_ICAO_PREFIXES):
            flags.append(
                Flag(
                    n,
                    "country_missing_defaulted_us",
                    "non-US-looking ICAO with no country; schema default US",
                )
            )

    fbo_name = raw.get("fbo_name")
    fbo = None
    if fbo_name:
        femail, ok = normalize_email(raw.get("fbo_email"))
        if not ok:
            flags.append(Flag(n, "invalid_fbo_email", "FBO email failed syntax validation; left empty"))
        fphone, parsed = normalize_phone(raw.get("fbo_phone"))
        if fphone and not parsed:
            flags.append(Flag(n, "phone_not_e164", "phone kept as supplied; not unambiguous"))
        fbo = {"name": fbo_name, "phone": fphone, "email": femail}
    elif raw.get("fbo_phone") or raw.get("fbo_email"):
        flags.append(Flag(n, "fbo_without_name", "FBO phone/email with no FBO name; not loaded"))

    data = {
        "icao": icao,
        "iata": iata,
        "faa_lid": (raw.get("faa_lid") or "").upper() or None,
        "name": raw["name"],
        "city": raw.get("city"),
        "state": _state(raw, n, flags),
        "country": country,
        "latitude": lat,
        "longitude": lon,
        "elevation_ft": _int_field(raw, "elevation_ft", -2000, 30000, n, flags),
        "longest_runway_ft": _int_field(raw, "longest_runway_ft", 100, 40000, n, flags),
        "timezone": raw.get("timezone"),
        "fbo": fbo,
    }
    bad = _too_long(data, {"name": 200, "city": 120, "faa_lid": 4, "timezone": 64})
    if bad:
        return Reject(n, f"value_too_long:{bad}")
    if fbo and (len(fbo["name"]) > 200 or len(fbo["phone"] or "") > 40):
        return Reject(n, "value_too_long:fbo")
    return Row(n, data, flags)


# ----------------------------------------------------------------------------- outreach
def validate_outreach(n: int, raw: Raw, cfg: IngestConfig, ctx: ValidationContext) -> Row | Reject:
    company = raw.get("company")
    if excluded_match(company, cfg.excluded):
        return Reject(n, EXCLUDED, "contact belongs to an excluded operator")
    if not raw.get("email"):
        return Reject(n, "missing_required:email")
    email, ok = normalize_email(raw.get("email"))
    if not ok or not email:
        return Reject(n, "invalid_email", "email failed syntax validation")

    flags: list[Flag] = []
    full = raw.get("full_name")
    if not full:
        full = clean(" ".join(p for p in (raw.get("first_name"), raw.get("last_name")) if p))
    if full and excluded_match(full, cfg.excluded):
        return Reject(n, EXCLUDED, "contact belongs to an excluded operator")
    data = {
        "email": email,
        "full_name": full,
        "company": company,
        "title": raw.get("title"),
        "segment": raw.get("segment"),
        "state": _state(raw, n, flags),
    }
    bad = _too_long(data, {"email": 320, "full_name": 200, "company": 200, "title": 200, "segment": 48})
    if bad:
        return Reject(n, f"value_too_long:{bad}")
    return Row(n, data, flags)


VALIDATORS = {
    "operators": validate_operator,
    "aircraft": validate_aircraft,
    "airports_fbos": validate_airport,
    "outreach_lists": validate_outreach,
}


# Target fields counted for "missing fields by column", per dataset.
def target_fields(cfg: IngestConfig, dataset: str) -> list[str]:
    return list(cfg.mappings[dataset].fields)
