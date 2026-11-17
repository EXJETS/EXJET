export function textField(form: FormData, name: string, max: number, min = 0) {
  const raw = form.get(name);
  if (typeof raw !== "string") throw new Error(`Enter ${name.replaceAll("_", " ")}.`);
  const value = raw.trim();
  if (value.length < min || value.length > max) throw new Error(`Check ${name.replaceAll("_", " ")}.`);
  return value;
}
export function airportField(form: FormData, name: string) {
  const value = textField(form, name, 4, 3).toUpperCase();
  if (!/^[A-Z0-9]{3,4}$/.test(value)) throw new Error("Use a three- or four-character airport code.");
  return value;
}
export function uuidField(form: FormData) {
  const value = textField(form, "id", 36, 36);
  if (!/^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value)) throw new Error("Invalid record.");
  return value;
}
export function dateField(form: FormData, name: string) {
  const value = textField(form, name, 10, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(`${value}T12:00:00Z`)) || new Date(`${value}T12:00:00Z`).toISOString().slice(0,10) !== value) throw new Error("Choose a valid departure date.");
  return value;
}
export function passengerField(form: FormData) {
  const value = Number(textField(form, "passengers", 3, 1));
  if (!Number.isInteger(value) || value < 1 || value > 100) throw new Error("Choose between 1 and 100 passengers.");
  return value;
}
