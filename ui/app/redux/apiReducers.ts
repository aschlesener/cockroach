import _ = require("lodash");
import { combineReducers } from "redux";
import { CachedDataReducer, CachedDataReducerState } from "./cachedDataReducer";
import * as api from "../util/api";
import { VersionList } from "../interfaces/cockroachlabs";
import { versionCheck, VersionCheckRequest } from "../util/cockroachlabsAPI";
import { NodeStatus, RollupStoreMetrics } from "../util/proto";

type ClusterResponseMessage = cockroach.server.serverpb.ClusterResponseMessage;
type EventsRequest = cockroach.server.serverpb.EventsRequest;
type EventsResponseMessage = cockroach.server.serverpb.EventsResponseMessage;
type HealthResponseMessage = cockroach.server.serverpb.HealthResponseMessage;
type RaftDebugResponseMessage = cockroach.server.serverpb.RaftDebugResponseMessage;
type NodesResponseMessage = cockroach.server.serverpb.NodesResponseMessage;

const TEN_SECONDS = 10 * 1000;
const TWO_SECONDS = 2 * 1000;

export let clusterReducerObj = new CachedDataReducer<void, ClusterResponseMessage>(api.getCluster, "cluster");
export let refreshCluster = clusterReducerObj.refresh;

export let eventsReducerObj = new CachedDataReducer<EventsRequest, EventsResponseMessage>(api.getEvents, "events", TEN_SECONDS);
export let refreshEvents = eventsReducerObj.refresh;

export type HealthState = CachedDataReducerState<HealthResponseMessage>;
export let healthReducerObj = new CachedDataReducer<void, HealthResponseMessage>(api.getHealth, "health", TWO_SECONDS);
export let refreshHealth = healthReducerObj.refresh;

export let raftReducerObj = new CachedDataReducer<void, RaftDebugResponseMessage>(api.raftDebug, "raft");
export let refreshRaft = raftReducerObj.refresh;

function rollupStoreMetrics(res: NodesResponseMessage) {
  return _.map(res.nodes, (node) => {
    RollupStoreMetrics(node);
    return node;
  });
}

export let nodesReducerObj = new CachedDataReducer<void, NodeStatus[]>(() => api.getNodes().then(rollupStoreMetrics), "nodes", TEN_SECONDS);
export let refreshNodes = nodesReducerObj.refresh;

export let versionReducerObj = new CachedDataReducer<VersionCheckRequest, VersionList>(versionCheck, "version");
export let refreshVersion = versionReducerObj.refresh;

export let apiReducers = combineReducers({
  [nodesReducerObj.actionNamespace]: nodesReducerObj.reducer,
  [eventsReducerObj.actionNamespace]: eventsReducerObj.reducer,
  [raftReducerObj.actionNamespace]: raftReducerObj.reducer,
  [healthReducerObj.actionNamespace]: healthReducerObj.reducer,
  [versionReducerObj.actionNamespace]: versionReducerObj.reducer,
  [clusterReducerObj.actionNamespace]: clusterReducerObj.reducer,
});