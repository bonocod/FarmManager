import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from '@/lib/store';
import Index from '@/pages/Index';
import Review from '@/pages/Review';
import DailyEggs from '@/pages/DailyEggs';
import Sales from '@/pages/Sales';
import Expenses from '@/pages/Expenses';
import SettingsPage from '@/pages/Settings';
import NotFound from '@/pages/NotFound';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/review" element={<Review />} />
          <Route path="/daily-eggs" element={<DailyEggs />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </StoreProvider>
  );
}
