import Constants from 'expo-constants';
import { RealDataProxy } from './RealDataProxy';
import { DummyDataProxy } from './DummyDataProxy';
import { DataProxy } from './DataProxyInterface';

class DataProxySingleton {
    private static instance: DataProxy;

    private constructor() {}

    public static getInstance(useDummyData?: boolean): DataProxy {
        if (!DataProxySingleton.instance) {
            DataProxySingleton.instance = useDummyData ? new DummyDataProxy() : new RealDataProxy();
        }
        return DataProxySingleton.instance;
    }
}

export {DataProxySingleton};
