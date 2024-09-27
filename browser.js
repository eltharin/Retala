class browserManager
{
    static async init_style()
    {
        browser.theme.getCurrent().then(getting => {
            document.body.style.backgroundColor = getting.colors.sidebar;
            document.body.style.color = getting.colors.sidebar_text;
        })
    }

    static async get_window_id()
    {
        const tabs = await browser.tabs.query({currentWindow: true})
        console.log(tabs)
        console.log(tabs[0].windowId)
        return tabs[0].windowId;
    }

    static iconColorTabs(windowId, session)
    {
        browser.browserAction.setBadgeText({text: session.name, windowId: windowId }).then(a => {
            browser.browserAction.setBadgeTextColor({color: invertColor(session.color, false),windowId: windowId });
            browser.browserAction.setBadgeBackgroundColor({'color': session.color , windowId: windowId });
        }).catch((e) => {});
    }
    static iconClear(windowId)
    {
        browser.browserAction.setBadgeText({text: null, windowId: windowId });
    }
}