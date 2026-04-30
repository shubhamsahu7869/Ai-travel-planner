import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "PlanMyYatra",
  description: "Plan trips with places to visit, costs, stays, and editable daily schedules.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-slate-100">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
