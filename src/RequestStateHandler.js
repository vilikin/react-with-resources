import _ from 'lodash';
import Request from './Request';

export default class RequestStateHandler {
  constructor() {
    this.state = {
      requests: [],
    };

    this.stateChangeListeners = [];
    this.lastStateChangeListenerId = 0;

    // TODO Remove this
    window.reqstate = this;
  }

  // TODO modify state to only contain an array if nothing else needed
  getCurrentState = () => _.cloneDeep(this.state.requests);

  findRequestById = id => _.find(this.state.requests, { id });

  getExistingRequest = instance => _.find(
    this.state.requests,
    ({ requestInstance }) => requestInstance.equals(instance),
  );

  addStateChangeListener = (callback) => {
    this.stateChangeListeners.push({
      callback,
      id: ++this.lastStateChangeListenerId,
    });

    return this.lastStateChangeListenerId;
  }

  removeStateChangeListener = (id) => {
    _.remove(this.stateChangeListeners, listener => listener.id === id);
  }

  callStateChangeListeners = () => {
    _.each(this.stateChangeListeners, listener => listener.callback(this.getCurrentState()));
  }

  completeRequest = (id, result, error) => {
    const request = this.findRequestById(id);

    _.merge(request, {
      result,
      error,
      loading: false,
      finishedAt: new Date(),
    });

    this.callStateChangeListeners();
  }

  appendRequest = (requestInstance) => {
    const id = _.uniqueId();

    const request = {
      id,
      requestInstance,
      result: null,
      loading: true,
      error: null,
      startedAt: new Date(),
      finishedAt: null,
    };

    this.state.requests.push(request);

    this.callStateChangeListeners();

    return _.cloneDeep(request);
  }

  makeRequest = (requestInstance) => {
    if (!(requestInstance instanceof Request)) throw new Error('Expected instance of Request');
    /*
    const requestConfig = requestInstance.getConfig();
    const existingRequest = this.getExistingRequest(requestInstance);

    if (requestConfig.cache && existingRequest) {
      return null;
    }
    */

    const request = this.appendRequest(requestInstance);

    const executeRequest = async () => {
      try {
        const result = await requestInstance.execute();
        this.completeRequest(request.id, result, null);

        return result;
      } catch (error) {
        this.completeRequest(request.id, null, error);
        throw error;
      }
    };

    return {
      ...request,
      promise: executeRequest(),
    };
  }

  makeMultipleRequests = (requestInstances) => {
    const requests = _.reduce(requestInstances, (result, requestInstance) => {
      const request = this.makeRequest(requestInstance);
      result.push(request);
      return result;
    }, []);

    return requests;
  }
}
