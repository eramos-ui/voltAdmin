const version='2.2 beta';
export const Footer = () => (
    <footer className="text-center text-gray-400 text-sm py-2 border-t">
      © {new Date().getFullYear()} eramosarellano@gmail.com. version {version}
    </footer>
  );