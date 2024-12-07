import { FireStoreDataProxy } from './FireStoreDataProxy';
import { MockDataProxy } from './MockDataProxy';
import { DataProxy } from './DataProxyInterface';

class DataProxySingleton {
    private static instance: DataProxy;

    private constructor() {}

    public static getInstance(useMockData?: boolean): DataProxy {
        DataProxySingleton.instance = useMockData ? new MockDataProxy() : new FireStoreDataProxy();
        DataProxySingleton.instance.initialize();
        return DataProxySingleton.instance;
    }
}

export {DataProxySingleton};
