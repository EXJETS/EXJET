import io
import json

import pytest

from exjet_api.ingest.config import DatasetMapping, FieldSpec
from exjet_api.ingest.mapping import map_columns, map_row
from exjet_api.ingest.readers import ReadError, read_source


def read(data: bytes, name: str):
    return read_source(io.BytesIO(data), name)


def test_csv_comma_semicolon_tab_pipe_delimiters():
    for delim in [",", ";", "\t", "|"]:
        data = (
            delim.join(["a", "b", "c"])
            + "\n"
            + delim.join(["1", "2", "3"])
            + "\n"
            + delim.join(["4", "5", "6"])
            + "\n"
        )
        f = read(data.encode(), "x.csv")
        assert f.headers == ["a", "b", "c"], delim
        assert [r.values["b"] for r in f.rows] == ["2", "5"]


def test_csv_encodings():
    text = "name,city\nJosé,Zürich\n"
    assert read(text.encode("utf-8"), "x.csv").rows[0].values["name"] == "José"
    assert read(b"\xef\xbb\xbf" + text.encode("utf-8"), "x.csv").headers == ["name", "city"]  # BOM stripped
    assert read(text.encode("cp1252"), "x.csv").rows[0].values["city"] == "Zürich"
    assert read(text.encode("utf-16"), "x.csv").rows[0].values["name"] == "José"


def test_csv_row_numbers_header_is_row_one_and_blank_rows_skipped():
    f = read(b"a,b\n1,2\n,\n3,4\n", "x.csv")
    assert [r.number for r in f.rows] == [2, 4]


def test_csv_quoted_values_with_delimiters_and_newlines():
    f = read(b'a,b\n"x, y","line1\nline2"\n', "x.csv")
    assert f.rows[0].values == {"a": "x, y", "b": "line1 line2"}


def test_xlsx_numbers_become_clean_strings(tmp_path):
    from openpyxl import Workbook

    wb = Workbook()
    ws = wb.active
    ws.append([None, None])  # leading blank row is skipped
    ws.append(["cert", "phone"])
    ws.append([12345.0, 2145550101])
    p = tmp_path / "x.xlsx"
    wb.save(p)
    f = read_source(p)
    assert f.rows[0].values == {"cert": "12345", "phone": "2145550101"}
    assert f.rows[0].number == 3
    assert len(f.sha256) == 64


def test_json_list_wrapped_object_and_lines():
    recs = [{"a": 1, "b": ["x", "y"]}, {"a": 2, "c": "z"}]
    for payload in (json.dumps(recs), json.dumps({"rows": recs}), "\n".join(json.dumps(r) for r in recs)):
        f = read(payload.encode(), "x.json")
        assert f.headers == ["a", "b", "c"]
        assert f.rows[0].values["b"] == "x; y"
        assert f.rows[1].number == 2


@pytest.mark.parametrize(
    "data,name",
    [
        (b"", "x.json"),
        (b"{}", "x.json"),
        (b"[1,2]", "x.json"),
        (b"abc", "x.xlsx"),
        (b"", "x.csv"),
        (b"a", "x.pdf"),
    ],
)
def test_unreadable_files_raise_readerror(data, name):
    with pytest.raises(ReadError):
        read(data, name)


def test_sha256_is_of_the_file_bytes():
    import hashlib

    data = b"a,b\n1,2\n"
    assert read(data, "x.csv").sha256 == hashlib.sha256(data).hexdigest()


MAPPING = DatasetMapping(
    dataset="t",
    fields={
        "dba_name": FieldSpec(
            "dba_name", required=True, satisfied_by=["legal_name"], aliases=["DBA", "operator name"]
        ),
        "legal_name": FieldSpec("legal_name", aliases=["Legal Entity"]),
        "cert": FieldSpec("cert", aliases=["Cert #"]),
        "other": FieldSpec("other", aliases=["x"]),
    },
    required_any=[["cert", "other"]],
    ignored=["Rating Source"],
)


def test_header_matching_ignores_case_and_punctuation():
    r = map_columns(["D.B.A.", "legal_entity", "CERT #", "Mystery", "Rating  Source"], MAPPING)
    assert r.colmap == {"dba_name": "D.B.A.", "legal_name": "legal_entity", "cert": "CERT #"}
    assert r.unmapped == ["Mystery"]  # not guessed
    assert r.ignored_count == 1
    assert r.missing_required == []


def test_missing_required_and_required_any_reported_not_guessed():
    r = map_columns(["Something"], MAPPING)
    assert r.missing_required == ["dba_name", "cert|other"]


def test_required_satisfied_by_alternate_field():
    r = map_columns(["Legal Entity", "x"], MAPPING)
    assert "dba_name" not in r.missing_required


def test_second_column_for_same_field_is_unmapped_not_overwritten():
    r = map_columns(["DBA", "Operator Name"], MAPPING)
    assert r.colmap["dba_name"] == "DBA"
    assert r.unmapped == ["Operator Name"]


def test_map_row_cleans_values():
    assert map_row({"A": "  x  ", "B": ""}, {"f": "A", "g": "B", "h": "Z"}) == {
        "f": "x",
        "g": None,
        "h": None,
    }
