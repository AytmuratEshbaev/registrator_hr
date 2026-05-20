export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t bg-white mt-auto">
      <div className="container mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <div>
          &copy; {year} ZEYIN mektebi school. Все права защищены.
        </div>
        <div className="flex items-center gap-4">
          <a href="mailto:hr@firma.uz" className="hover:text-foreground transition-colors">
            hr@firma.uz
          </a>
          <a href="tel:+998711234567" className="hover:text-foreground transition-colors">
            +998 71 123-45-67
          </a>
        </div>
      </div>
    </footer>
  );
}
