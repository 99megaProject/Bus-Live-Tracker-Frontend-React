import { request } from "./client";

export const getEtaData = (busId) => request(`/bus/chart/${busId}`);