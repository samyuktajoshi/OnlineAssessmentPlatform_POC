import Navbar from "./Navbar";
import Footer from "./Footer";

function Layout({ children }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      }}
    >
      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <main
        style={{
          flex: 1,
          padding: "20px",
        }}
      >
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Layout;