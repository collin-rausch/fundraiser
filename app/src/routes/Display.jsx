import { useCallback, useEffect, useState } from 'react';
import DisplayView from '../components/DisplayView';
import { getGoalData } from '../lib/storage';

const POLL_MS = 30_000;

export default function Display() {
  const [data, setData] = useState(getGoalData);

  const refresh = useCallback(() => {
    setData(getGoalData());
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  return <DisplayView data={data} />;
}
