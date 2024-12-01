import { RealDataProxy } from './RealDataProxy';
import { DummyDataProxy } from './DummyDataProxy';
import { DataProxy } from './DataProxyInterface';

const useDummyData = true; // Set this to false to use real API endpoints
const dataProxy: DataProxy = useDummyData ? new DummyDataProxy() : new RealDataProxy();
export { dataProxy };
