import nodeMailjet from "node-mailjet";
export function getMailjet() {
  const apiKey = process.env.MAILJET_API_KEY;
  const apiSecret = process.env.MAILJET_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("MAILJET_API_KEY/MAILJET_API_SECRET missing in env");
  }
  return new (nodeMailjet as any)({ apiKey, apiSecret });
}
