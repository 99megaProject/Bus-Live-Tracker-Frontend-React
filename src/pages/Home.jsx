import { useEffect } from "react";
import { Link } from "react-router-dom";
import useApi from "../hooks/useApi";
import { getEtaData } from "../api/services";
import { getBusId } from "./Settings";
import LocalSpinner from "../components/loaders/LocalSpinner";
import StatusCard from "../components/StatusCard";

export default function Home() {
  const { data, loading, error, run } = useApi(getEtaData);

  useEffect(() => {
    run(getBusId());
  }, [run]);

  return (
    <div className="page">
      <h1>Home</h1>
      <p className="muted">Bus {getBusId()}</p>

      <section className="section">
        {loading && <LocalSpinner />}
        {error && <div className="error">{error}</div>}
        {data && <StatusCard info={data.curr_info} />}
      </section>

      <Link to="/eta" className="btn">View ETA chart</Link>
    </div>
  );
}