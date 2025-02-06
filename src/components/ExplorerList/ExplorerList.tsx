import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import ExplorerItem from "../ExplorerItem/ExplorerItem";
import AppContext from "../AppContext";
import { useEffect, useState, useContext, useCallback, useRef } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import ExplorerHead, {
  headCells,
  HeadCell,
} from "../ExplorerHead/ExplorerHead";
import { debounce } from "lodash-es";
import { IRule } from "../../types/IRule";
import { IRules } from "../../types/IRules";
import { IQuery } from "../../types/IQuery";
import { IFilter } from "../../types/IFilter";

enum FetchType {
  FilterSort,
  Pagination,
}

interface Fetch {
  params: IQuery;
  type: FetchType;
}

export default function ExplorerList() {
  const {
    dataService,
    dirtyExplorerList,
    setDirtyExplorerList,
    order,
    orderBy,
    searchText,
    selectedRule,
    isRuleSelected,
    setModifiedRule,
    setUnmodifiedRule,
    setCreator,
    activeColumns
  } = useContext(AppContext);
  const [rulesList, setRulesList] = useState([]);
  const [wantsMoreRules, setWantsMoreRules] = useState<boolean>(false);
  const [paginationLinks, setPaginationLinks] = useState<IQuery>(null);
  const [rulesLoaded, setRulesLoaded] = useState<boolean>(false);
  const [fetchParams, setFetchParams] = useState<Fetch>(null);
  const rulesListRef = useRef<any>();

  /* More rules exist than the ones already loaded in the scroll pane */
  const hasMoreRules = useCallback(
    () => paginationLinks !== undefined && paginationLinks !== null,
    [paginationLinks]
  );

  /* Scrollbars are missing when there aren't enough rules fetched to fill the left pane */
  const scrollbarsMissing = useCallback(
    () => rulesListRef.current.clientWidth === rulesListRef.current.offsetWidth,
    [rulesListRef]
  );

  const populateRulesList = useCallback(
    (responseJson: IRules) => {
      setPaginationLinks(responseJson.next);
      setRulesList([
        ...rulesList,
        ...responseJson.rules.map((ruleItem: IRule) => {
          return <ExplorerItem key={ruleItem.id} {...ruleItem} />;
        }),
      ]);
      setRulesLoaded(true);
    },
    [rulesList]
  );

  const getRulesPagination = useCallback(
    async (params) =>
      dataService
        .get_rules_pagination(params)
        .then(populateRulesList)
        .catch((error) => {
          if (error.name === "AbortError") return;
          console.log(`Error ${error}`);
        }),
    [dataService, populateRulesList]
  );

  const getRulesFilterSort = useRef(
    debounce(
      async (params) =>
        dataService
          .get_rules_filter_sort(params)
          .then(populateRulesList)
          .catch((error) => {
            if (error.name === "AbortError") return;
            console.log(`Error ${error}`);
          }),
      500
    )
  ).current;

  /* Fetch from api data service */
  useEffect(() => {
    if (dataService && fetchParams !== null) {
      switch (fetchParams.type) {
        case FetchType.FilterSort:
          getRulesFilterSort(fetchParams.params);
          break;
        case FetchType.Pagination:
          getRulesPagination(fetchParams.params);
          break;
      }
      setFetchParams(null);
    }
  }, [fetchParams, dataService, getRulesFilterSort, getRulesPagination]);

  /* Load fresh list of rules */
  useEffect(() => {
    if (dirtyExplorerList) {
      setPaginationLinks(null);
      setRulesList([]);
      const params = {
        orderBy: orderBy,
        order: order,
        select: headCells.map((headCell: HeadCell) => headCell.filterParam),
        filters: Object.entries(searchText)
        .filter(([filterName, filterValue]) => {
          return !(filterValue == null || filterValue === "");
        })
        .map(([filterName, filterValue]): IFilter => {
          return {
            name: filterName,
            operator: "contains",
            value: filterValue
          };
        }),
    };
      setFetchParams({
        params: params,
        type: FetchType.FilterSort,
      });
      setDirtyExplorerList(false);
      setRulesLoaded(false);
    }
  }, [dirtyExplorerList, setDirtyExplorerList, orderBy, order, searchText]);

  /* More rules requested or rules didn't fill scrollbars. Load additional rules. */
  useEffect(() => {
    if (
      rulesLoaded &&
      hasMoreRules() &&
      (wantsMoreRules || scrollbarsMissing())
    ) {
      setFetchParams({
        params: paginationLinks,
        type: FetchType.Pagination,
      });
      setWantsMoreRules(false);
      setRulesLoaded(false);
    }
  }, [
    rulesLoaded,
    hasMoreRules,
    wantsMoreRules,
    scrollbarsMissing,
    paginationLinks,
  ]);

  /* Load the editor with a new value */
  useEffect(() => {
    if (isRuleSelected()) {
      dataService.get_rule(selectedRule).then((responseJson: IRule) => {
        setCreator(responseJson.creator);
        setUnmodifiedRule(responseJson);
        setModifiedRule(responseJson.content);
      });
    }
  }, [
    selectedRule,
    dataService,
    isRuleSelected,
    setModifiedRule,
    setUnmodifiedRule,
    setCreator,
  ]);

  useEffect(() => {
    setDirtyExplorerList(true);
  }, [setDirtyExplorerList, searchText, order, orderBy]);

  return (
    <>
      <TableContainer
        id="rulesList"
        ref={rulesListRef}
        sx={{ width: "100%", overflow: "auto", bgcolor: "background.paper" }}
      >
        <Table stickyHeader size="small">
          <ExplorerHead />
          <TableBody>{rulesList}</TableBody>
        </Table>
      </TableContainer>
      <InfiniteScroll
        dataLength={rulesList.length}
        next={() => setWantsMoreRules(true)}
        hasMore={hasMoreRules()}
        loader={<h4>More rules available...</h4>}
        endMessage={
          <p style={{ textAlign: "center" }}>
            <b>All {rulesList.length} rules loaded.</b>
          </p>
        }
        scrollableTarget="rulesList"
        children=""
      ></InfiniteScroll>
    </>
  );
}
