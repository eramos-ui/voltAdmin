const version='2.1 gamma';
export const Footer = () => (
    <footer className="text-center text-gray-500 text-sm py-4 border-t">
      © {new Date().getFullYear()} eramosarellano@gmail.com. version {version}
    </footer>
  );