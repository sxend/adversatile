import { entries } from "./ObjectUtils";
import { isString } from "./TypeCheck";
import { RandomId } from "./RandomId";

// FIXME migrate to pajs
export default function(...args: any[]) {
  const method = args[0];
  if (method === "send") {
    send(args[1]);
  }
};
const BACKEND_API_URL = "/* @echo BACKEND_API_URL */";
function send(params: any) {
  if (isString(params)) return;
  params["_"] = RandomId.gen(); // cache buster
  const query = entries(params).map((entry) => {
    return `${encodeURIComponent(entry[0])}=${encodeURIComponent(JSON.stringify(entry[1]))}`;
  }).join("&");
  const img = document.createElement("img");
  img.src = `${BACKEND_API_URL}/v1/collect?${query}`;
  img.style.display = "none";
  document.body.appendChild(img);
}