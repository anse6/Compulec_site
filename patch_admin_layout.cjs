const fs = require('fs');

let content = fs.readFileSync('src/Composant/Admin/AdminLayout.jsx', 'utf8');

// Fix Sidebar
content = content.replace(/background: \"\",/g, 'background: "var(--ant-color-bg-container)",');
content = content.replace(/borderRight: \"\",/g, 'borderRight: "1px solid var(--ant-color-border-secondary)",');
content = content.replace(/background: isActive \? \(\"\"\) : \"transparent\",/g, 'background: isActive ? "var(--ant-color-primary)" : "transparent",');
content = content.replace(/color: isActive \? \"#fff\" : \(\"\"\),/g, 'color: isActive ? "#fff" : "var(--ant-color-text-description)",');
content = content.replace(/color: \"\",/g, 'color: "var(--ant-color-text)",');

// Fix TopHeader
content = content.replace(/function TopHeader\(\{ user \}\)/, 'function TopHeader({ isDarkMode, setIsDarkMode, user })');
content = content.replace(/<TopHeader\s+user=\{user\}\s*\/>/, '<TopHeader isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} user={user} />');

const toggleStr = `{/* Mode toggle */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            background: isDarkMode ? "#334155" : "#F1F5F9",
            borderRadius: 999,
            padding: "3px 4px",
            gap: 2,
          }}
        >
          <div
            onClick={() => setIsDarkMode(false)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: !isDarkMode ? "#fff" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: !isDarkMode ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              color: !isDarkMode ? "#F59E0B" : "#94A3B8",
              transition: "all 0.2s",
            }}
          >
            <SunOutlined style={{ fontSize: 15 }} />
          </div>
          <div
            onClick={() => setIsDarkMode(true)}
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: isDarkMode ? "#1E293B" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: isDarkMode ? "#38BDF8" : "#94A3B8",
              boxShadow: isDarkMode ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
              transition: "all 0.2s",
            }}
          >
            <MoonOutlined style={{ fontSize: 15 }} />
          </div>
        </div>

        {/* Notifications */}`;

content = content.replace(/\{\/\*\s*Notifications\s*\*\/\}/, toggleStr);

// Fix AdminLayout state
content = content.replace(/const user = useSelector\(selectCurrentUser\);/, 'const user = useSelector(selectCurrentUser);\n  const [isDarkMode, setIsDarkMode] = React.useState(false);');

// Fix ConfigProvider theme
const configProviderStr = `theme={{
        cssVar: true,
        algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: isDarkMode ? "#38bdf8" : "#023B6A",
          colorTextBase: isDarkMode ? "#F8FAFC" : "#0F172A",
          colorBgBase: isDarkMode ? "#1E293B" : "#ffffff",
          borderRadius: 8,
          fontFamily: "'Poppins', sans-serif",
        },
        components: {
          Input: {
            colorBgContainer: isDarkMode ? "#1E293B" : "#ffffff",
            colorBorder: isDarkMode ? "#334155" : "#E2E8F0",
            colorTextPlaceholder: isDarkMode ? "#64748B" : "#94A3B8",
            hoverBorderColor: isDarkMode ? "#475569" : "#cbd5e1",
            activeBorderColor: isDarkMode ? "#38bdf8" : "#023B6A",
          },
          Select: {
            colorBgContainer: isDarkMode ? "#1E293B" : "#ffffff",
            colorBorder: isDarkMode ? "#334155" : "#E2E8F0",
            colorTextPlaceholder: isDarkMode ? "#64748B" : "#94A3B8",
            hoverBorderColor: isDarkMode ? "#475569" : "#cbd5e1",
            activeBorderColor: isDarkMode ? "#38bdf8" : "#023B6A",
            colorText: isDarkMode ? "#F8FAFC" : "#0F172A",
            colorBgElevated: isDarkMode ? "#1E293B" : "#ffffff",
            controlItemBgActive: isDarkMode ? "#334155" : "#F8FAFC",
            controlItemBgHover: isDarkMode ? "#475569" : "#F1F5F9",
          },
          Table: {
            headerBg: isDarkMode ? "#1E293B" : "#ffffff",
            headerColor: isDarkMode ? "#F8FAFC" : "#64748B",
            rowHoverBg: isDarkMode ? "#334155" : "#F8FAFC",
            borderColor: isDarkMode ? "#334155" : "#F1F5F9",
            colorBgContainer: isDarkMode ? "#0F172A" : "#ffffff",
          },
          Pagination: {
            itemBg: isDarkMode ? "transparent" : "#ffffff",
            itemActiveBg: isDarkMode ? "#38bdf8" : "#023B6A",
            itemActiveColor: "#ffffff",
            colorText: isDarkMode ? "#F8FAFC" : "#0F172A",
          },
        },
      }}`;

content = content.replace(/theme=\{\{[\s\S]*?\}\}\s*>/, configProviderStr + '\n    >');

// Fix layout backgrounds
content = content.replace(/<div\s*\n\s*style=\{\{/m, '<div\n        className={isDarkMode ? "dark" : ""}\n        style={{');
content = content.replace(/background: "var\(--ant-color-bg-container\)",\s*fontFamily:/, 'background: isDarkMode ? "#0F172A" : "#F0F2F8",\n          fontFamily:');
content = content.replace(/overflow: "hidden",\s*background: "var\(--ant-color-bg-container\)",/, 'overflow: "hidden",\n            background: isDarkMode ? "#0F172A" : "#F0F2F8",');

fs.writeFileSync('src/Composant/Admin/AdminLayout.jsx', content);
console.log('Fixed AdminLayout.jsx');
