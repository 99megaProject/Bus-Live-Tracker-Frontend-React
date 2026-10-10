import { request } from "./client";

const post = (path, body, full = false) =>
  request(path, { method: "POST", body: JSON.stringify(body) }, full);

// ---- auth (ASSUMED path/body: adjust to your backend) ----
const ROLE_PATH = {
  stu: "student",
  tea: "teacher",
  driv: "driver",
  admin: "admin",
};

export const login = ({ type, id, password }) =>
  post(
    `/${ROLE_PATH[type]}/login`,
    type === "stu"
      ? { uni_id: id, password }
      : type === "admin"
        ? { phone: id, password } // ASSUMED admin login field
        : { phone: id, password },
  );
export const logout = (type) => post(`/${ROLE_PATH[type]}/logout`, {});
export const getMe = (type) => request(`/${ROLE_PATH[type]}/me`);

// role = "student" | "teacher" | "driver"  ->  /admin/students|teachers|drivers/register
export const registerUser = (role, payload) =>
  post(`/admin/${role}s/register`, payload);

// ---- bus ----
export const getEtaData = (busId) => request(`/bus/chart/${busId}`);
export const getCurrInfo = (busId) => request(`/bus-curr-info/${busId}`);

// ---- contribution (ASSUMED body: { bus_number, stop_id, status }) ----
export const sendContribution = (payload) => post("/contribution", payload);
export const contributionNext = (payload) =>
  post("/contribution-next", payload, true);
