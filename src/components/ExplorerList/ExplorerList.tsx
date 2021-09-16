import List from "@material-ui/core/List";
import ExplorerItem from "../ExplorerItem/ExplorerItem";
import AppContext from "../AppContext";
import { useEffect, useState, useContext, useCallback, useRef } from "react";
import InfiniteScroll from 'react-infinite-scroll-component';

export interface PaginationLink {
    href: string;
}

export interface PaginationLinks {
    prev?: PaginationLink;
    self: PaginationLink;
    next?: PaginationLink;
}

export interface FetchParams {
    pageOffset: number;
    pageLimit: number;
}

export default function ExplorerList() {

    const { dataService, dirtyExplorerList, setDirtyExplorerList } = useContext(AppContext);
    const [rulesList, setRulesList] = useState<typeof ExplorerItem[]>([]);
    const [wantsMoreRules, setWantsMoreRules] = useState<boolean>(false);
    const [paginationLinks, setPaginationLinks] = useState<PaginationLinks>(null);
    const [rulesLoaded, setRulesLoaded] = useState<boolean>(false);
    const [fetchParams, setFetchParams] = useState<FetchParams>(null);
    const rulesListRef = useRef<any>();

    /* More rules exist than the ones already loaded in the scroll pane */
    const hasMoreRules = useCallback(() =>
        paginationLinks !== null && 'next' in paginationLinks,
        [paginationLinks]
    );

    /* Scrollbars are missing when there aren't enough rules fetched to fill the left pane */
    const scrollbarsMissing = useCallback(() =>
        rulesListRef.current.clientWidth === rulesListRef.current.offsetWidth,
        [rulesListRef]
    );

    /* Fetch from api data service */
    useEffect(() => {
        if (dataService && fetchParams) {
            dataService.get_rules(fetchParams.pageOffset, fetchParams.pageLimit)
                .then(function (response) {
                    return response.json();
                })
                .then(function (responseJson) {
                    const parsed = JSON.parse(responseJson.body);
                    setPaginationLinks(parsed.links);
                    setRulesList([
                        ...rulesList,
                        ...parsed.data.map((ruleItem, ruleIndex) => (
                            <ExplorerItem
                                key={ruleItem.id}
                                storageId={ruleItem.id}
                                coreId={ruleItem.attributes.title}
                                ruleType={ruleItem.attributes.field_conformance_rule_type}
                                creator={ruleItem.attributes.field_conformance_rule_creator}
                            />
                        ))
                    ]);
                    setRulesLoaded(true);
                });
            setFetchParams(null);
        }
    }, [fetchParams, dataService, rulesList]);

    /* Load fresh list of rules */
    useEffect(() => {
        if (dirtyExplorerList) {
            setPaginationLinks(null);
            setRulesList([]);
            setFetchParams({ pageOffset: 0, pageLimit: 50 });
            setDirtyExplorerList(false);
            setRulesLoaded(false);
        }
    }, [dirtyExplorerList, setDirtyExplorerList]);

    /* More rules requested or rules didn't fill scrollbars. Load additional rules. */
    useEffect(() => {
        if (rulesLoaded && hasMoreRules() && (wantsMoreRules || scrollbarsMissing())) {
            const pageOffsetRegex = /page%5Boffset%5D=(?<pageOffset>\d+)/;
            const pageLimitRegex = /page%5Blimit%5D=(?<pageLimit>\d+)/;
            const pageOffset = parseInt(paginationLinks.next.href.match(pageOffsetRegex).groups.pageOffset);
            const pageLimit = parseInt(paginationLinks.next.href.match(pageLimitRegex).groups.pageLimit);
            setFetchParams({ pageOffset: pageOffset, pageLimit: pageLimit });
            setWantsMoreRules(false);
            setRulesLoaded(false);
        }
    }, [rulesLoaded, hasMoreRules, wantsMoreRules, scrollbarsMissing, paginationLinks]);

    return (
        <List ref={rulesListRef} id="rulesList" sx={{ width: '100%', overflow: 'auto', bgcolor: 'background.paper' }} >
            <InfiniteScroll
                dataLength={rulesList.length}
                next={() => setWantsMoreRules(true)}
                hasMore={hasMoreRules()}
                loader={<h4>Loading rules list...</h4>}
                endMessage={
                    <p style={{ textAlign: 'center' }}>
                        <b>All rules loaded.</b>
                    </p>
                }
                scrollableTarget="rulesList"

                /*below props only if you need pull down functionality*/
                refreshFunction={() => setDirtyExplorerList(true)}
                pullDownToRefresh
                pullDownToRefreshThreshold={50}
                pullDownToRefreshContent={
                    <h3 style={{ textAlign: 'center' }}>&#8595; Pull down to refresh</h3>
                }
                releaseToRefreshContent={
                    <h3 style={{ textAlign: 'center' }}>&#8593; Release to refresh</h3>
                }

            >
                {rulesList}
            </InfiniteScroll>
        </List>
    );
}
