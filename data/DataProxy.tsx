import { FireStoreDataProxy } from './FireStoreDataProxy';
import { DummyDataProxy } from './DummyDataProxy';
import { DataProxy } from './DataProxyInterface';

class DataProxySingleton {
    private static instance: DataProxy;

    private constructor() {}

    public static getInstance(useDummyData?: boolean): DataProxy {
        DataProxySingleton.instance = useDummyData ? new DummyDataProxy() : new FireStoreDataProxy();
        DataProxySingleton.instance.initialize();
        return DataProxySingleton.instance;
    }
}

export {DataProxySingleton};
