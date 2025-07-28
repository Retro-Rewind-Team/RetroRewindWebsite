import { createSignal, createMemo, createEffect } from "solid-js";
import { useQuery } from "@tanstack/solid-query";
import { api } from "../services/api";
import { LeaderboardRequest } from "../types";
import { useMiiLoader } from "./useMiiLoader";

export function useLeaderboard() {
  // State for filters and pagination
  const [currentPage, setCurrentPage] = createSignal(1);
  const [pageSize, setPageSize] = createSignal(50);
  const [search, setSearch] = createSignal("");
  const [activeOnly, setActiveOnly] = createSignal(false);
  const [sortBy, setSortBy] = createSignal("rank");
  const [ascending, setAscending] = createSignal(true);
  const [searchQuery, setSearchQuery] = createSignal("");
  const [timePeriod, setTimePeriod] = createSignal("24");

  const miiLoader = useMiiLoader();

  // Debounced search
  let searchTimeout: ReturnType<typeof setTimeout>;
  const handleSearchInput = (value: string) => {
    setSearchQuery(value);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      setSearch(value);
      setCurrentPage(1);
    }, 300);
  };

  // Create the request object
  const leaderboardRequest = createMemo(
    (): LeaderboardRequest => ({
      page: currentPage(),
      pageSize: pageSize(),
      search: search() || undefined,
      activeOnly: activeOnly(),
      sortBy: sortBy(),
      ascending: ascending(),
      timePeriod: timePeriod(),
    })
  );

  // Queries
  const statsQuery = useQuery(() => ({
    queryKey: ["stats"],
    queryFn: () => api.getStats(),
    refetchInterval: 60000,
  }));

  const leaderboardQuery = useQuery(() => ({
    queryKey: ["leaderboard", leaderboardRequest()],
    queryFn: () => api.getLeaderboard(leaderboardRequest()),
    refetchInterval: 60000,
  }));

  createEffect(() => {
    const players = leaderboardQuery.data?.players;
    if (players && players.length > 0) {
      const friendCodes = players.map((player) => player.friendCode);

      setTimeout(() => {
        miiLoader.loadMiisBatch(friendCodes);
      }, 100);
    }
  });

  const handleSort = (field: string) => {
    if (sortBy() === field) {
      setAscending(!ascending());
    } else {
      setSortBy(field);
      setAscending(false);
      if (field === "rank") {
        setAscending(true);
      }
    }
    setCurrentPage(1);
  };

  const handleActiveOnlyChange = (checked: boolean) => {
    setActiveOnly(checked);
    setCurrentPage(1);
  };

  const handleTimePeriodChange = (period: string) => {
    setTimePeriod(period);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const getVRGain = (player: any) => {
    switch (timePeriod()) {
      case "week":
        return player.vrStats.lastWeek;
      case "month":
        return player.vrStats.lastMonth;
      default:
        return player.vrStats.last24Hours;
    }
  };

  const refreshLeaderboard = () => {
    leaderboardQuery.refetch();
    statsQuery.refetch();
  };

  return {
    // State
    currentPage,
    pageSize,
    search,
    activeOnly,
    sortBy,
    ascending,
    searchQuery,
    timePeriod,

    // Queries
    statsQuery,
    leaderboardQuery,

    // Handlers
    handleSearchInput,
    handleSort,
    handleActiveOnlyChange,
    handleTimePeriodChange,
    handlePageSizeChange,
    getVRGain,
    refreshLeaderboard,

    // Setters for pagination
    setCurrentPage,

    // Mii loader
    miiLoader,
  };
}
