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
import { debounce } from "lodash";

export interface PaginationLink {
  href: string;
}

export interface PaginationLinks {
  prev?: PaginationLink;
  self: PaginationLink;
  next?: PaginationLink;
}

enum FetchType {
  FilterSort,
  Pagination,
}

interface Fetch {
  params: string;
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
    setPublished,
  } = useContext(AppContext);
  const [rulesList, setRulesList] = useState<typeof ExplorerItem[]>([]);
  const [wantsMoreRules, setWantsMoreRules] = useState<boolean>(false);
  const [paginationLinks, setPaginationLinks] = useState<PaginationLinks>(null);
  const [rulesLoaded, setRulesLoaded] = useState<boolean>(false);
  const [fetchParams, setFetchParams] = useState<Fetch>(null);
  const rulesListRef = useRef<any>();

  /* More rules exist than the ones already loaded in the scroll pane */
  const hasMoreRules = useCallback(
    () => paginationLinks !== null && "next" in paginationLinks,
    [paginationLinks]
  );

  /* Scrollbars are missing when there aren't enough rules fetched to fill the left pane */
  const scrollbarsMissing = useCallback(
    () => rulesListRef.current.clientWidth === rulesListRef.current.offsetWidth,
    [rulesListRef]
  );

  const populateRulesList = useCallback(
    (responseJson) => {
      setPaginationLinks(responseJson.links);
      setRulesList([
        ...rulesList,
        ...responseJson.data.map((ruleItem, ruleIndex) => (
          <ExplorerItem
            key={ruleItem.id}
            storageId={ruleItem.id}
            coreId={ruleItem.attributes.title}
            ruleType={ruleItem.attributes.field_conformance_rule_type}
            creator={ruleItem.attributes.field_conformance_rule_creator}
            published={ruleItem.attributes.status}
            created={ruleItem.attributes.created}
            changed={ruleItem.attributes.changed}
          />
        )),
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
      const sortParams = orderBy
        ? "sort=" + (order === "desc" ? "-" : "") + orderBy
        : "";
      const filterParams = Object.entries(searchText).reduce(
        (previousValue, currentValue) => {
          return (
            previousValue +
            (previousValue && currentValue[1] ? "&" : "") +
            (currentValue[1]
              ? `filter[${currentValue[0]}][operator]=CONTAINS&filter[${currentValue[0]}][value]=${currentValue[1]}`
              : "")
          );
        },
        ""
      );
      const includeParams =
        "fields[node--conformance_rule]=" +
        headCells.map((headCell: HeadCell) => headCell.queryParam).join(",");
      setFetchParams({
        params: [includeParams, sortParams, filterParams]
          .filter((value: string) => value)
          .join("&"),
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
        params: paginationLinks.next.href.split("?")[1],
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
      /* Unset before the async call so that api is only called once */
      dataService
        .get_rule(selectedRule)
        .then(function (response) {
          return response.json();
        })
        .then(function (responseJson) {
          const attributes = JSON.parse(responseJson.body).data.attributes;
          setCreator(attributes.field_conformance_rule_creator);
          setPublished(attributes.status);
          const content = attributes.body.value;
          setUnmodifiedRule(content);
          setModifiedRule(content);
        });
    }
  }, [
    selectedRule,
    dataService,
    isRuleSelected,
    setModifiedRule,
    setUnmodifiedRule,
    setCreator,
    setPublished,
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
