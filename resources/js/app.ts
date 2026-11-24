import { createInertiaApp } from '@inertiajs/vue3';
import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import { initializeTheme } from '@/composables/useAppearance';
import AppLayout from '@/layouts/AppLayout.vue';
import AuthLayout from '@/layouts/AuthLayout.vue';
import SettingsLayout from '@/layouts/settings/Layout.vue';
import { initializeFlashToast } from '@/lib/flashToast';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';
const vuetify = createVuetify({
    theme: {
        defaultTheme: 'light',
        themes: {
            light: {},
            dark: {},
        },
    },
});

void createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    layout: (name) => {
        switch (true) {
            case name === 'Welcome':
                return null;
            case name.startsWith('auth/'):
                return AuthLayout;
            case name.startsWith('settings/'):
                return [AppLayout, SettingsLayout];
            default:
                return AppLayout;
        }
    },
    withApp: (app) => {
        app.use(vuetify);
        app.directive('focus', {
            mounted: (el: HTMLElement, shouldFocus) => {
                if (shouldFocus.value !== false) {
                    el.focus();
                }
            },
        });
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on page load...
initializeTheme();

if (typeof document !== 'undefined') {
    const syncVuetifyTheme = () => {
        vuetify.theme.global.name.value = document.documentElement.classList.contains('dark')
            ? 'dark'
            : 'light';
    };

    syncVuetifyTheme();
    new MutationObserver(syncVuetifyTheme).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class'],
    });
}

// This will listen for flash toast data from the server...
initializeFlashToast();
