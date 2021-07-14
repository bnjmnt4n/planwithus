import { QueryClient, QueryClientProvider } from "react-query";

import Main from "./Main";

const queryClient = new QueryClient();

const App = (): JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex flex-col">
        <header className="w-full p-4 text-2xl text-center font-bold">
          <h1>plaNwithUS</h1>
        </header>
        <Main />
      </div>
    </QueryClientProvider>
  );
};

export default App;
