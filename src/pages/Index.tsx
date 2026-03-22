import { AppProvider } from '@/context/AppContext';
import DSASidebar from '@/components/layout/DSASidebar';
import MainContent from '@/components/layout/MainContent';

export default function Index() {
  return (
    <AppProvider>
      <div className="flex h-screen w-full bg-background overflow-hidden">
        <DSASidebar />
        <div className="flex-1 ml-0 md:ml-64 transition-all duration-300">
          <MainContent />
        </div>
      </div>
    </AppProvider>
  );
}
