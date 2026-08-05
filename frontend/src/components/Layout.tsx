import { AppShell, Container, Group, NavLink } from '@mantine/core';
import { NavLink as RouterNavLink, Outlet } from 'react-router-dom';

function CalendarIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M3 10h18" stroke="currentColor" strokeWidth="2" />
      <path d="M8 2v4M16 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <rect x="7" y="13" width="3" height="3" rx="1" fill="currentColor" />
      <rect x="14" y="13" width="3" height="3" rx="1" fill="currentColor" />
    </svg>
  );
}

export function Layout() {
  return (
    <AppShell header={{ height: 64 }}>
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group justify="space-between" h="100%" align="center">
            <Group gap="sm" align="center">
              <CalendarIcon />
              <span className="brand">Календарь</span>
            </Group>
            <Group gap="sm" align="center">
              <RouterNavLink to="/" end className="nav-link">
                {({ isActive }) => (
                  <NavLink component="span" active={isActive} label="Главная" />
                )}
              </RouterNavLink>
              <RouterNavLink to="/admin" className="nav-link">
                {({ isActive }) => (
                  <NavLink component="span" active={isActive} label="Админка" />
                )}
              </RouterNavLink>
              <RouterNavLink to="/admin/bookings" className="nav-link">
                {({ isActive }) => (
                  <NavLink component="span" active={isActive} label="Встречи" />
                )}
              </RouterNavLink>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Container size="lg" className="page-container">
          <Outlet />
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
