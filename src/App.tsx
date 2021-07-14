import { QueryClient, QueryClientProvider } from "react-query";

import { Main } from "./Main";

const queryClient = new QueryClient();

const App = (): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <Main />
    </QueryClientProvider>
  );
};

export default App;
