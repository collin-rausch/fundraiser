import { resolveTheme } from '../lib/themes';
import './ThemePreview.css';

export default function ThemePreview({ themeConfig, title, raised, goal, percent }) {
  const theme = resolveTheme(themeConfig);
  const style = theme.cssVars;

  return (
    <div className="theme-preview" style={style}>
      <div className="theme-preview-bg" />
      <div className="theme-preview-content">
        <div className="theme-preview-thermo">
          <div
            className="theme-preview-fill"
            style={{ height: `${Math.min(100, percent)}%` }}
          />
        </div>
        <div className="theme-preview-stats">
          <span className="theme-preview-title">{title || 'Campaign'}</span>
          <span className="theme-preview-amount">${raised?.toLocaleString()}</span>
          <span className="theme-preview-pct">{Math.round(percent)}%</span>
        </div>
      </div>
    </div>
  );
}
