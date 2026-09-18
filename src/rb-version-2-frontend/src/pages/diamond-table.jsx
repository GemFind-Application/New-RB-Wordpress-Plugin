import { useCallback } from "react";
import Head1 from "../components/head1";
import DiamondNavigation from "../components/diamond-navigation";
import DiamondFilter from "../components/diamond-filter";
import List1 from "../components/list1";
import PaginationPanel from "../components/pagination-panel";
import { useNavigate } from "react-router-dom";
import "./diamond-table.css";

const DiamondTable = () => {
  const navigate = useNavigate();

  const onRectangleClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <div className="diamond-table">
      <Head1 />
      <DiamondNavigation />
      <DiamondFilter />
      <List1 />
      <PaginationPanel />
      <div className="diamond-table-child" onClick={onRectangleClick} />
    </div>
  );
};

export default DiamondTable;
