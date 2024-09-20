let windowId = null;

document.addEventListener("DOMContentLoaded", (e) => {
	storage.get_sessions().then((sessions) => {
		browser.tabs.query({currentWindow: true}).then((tabs) => {
			windowId = tabs[0].windowId;
			reload_sessions_table(sessions);
		});
	});
});

addEvent('click', '.add_window', (e) => {
	storage.add_window_to_session(e.target.closest('td').dataset.sessionId, windowId).then((sessions) => {
		reload_sessions_table(sessions);
	});
});

addEvent('click', '.remove_window', (e) => {
	storage.remove_window_from_session(e.target.closest('td').dataset.sessionId, windowId).then((sessions) => {
		reload_sessions_table(sessions);
	});
});

addEvent('click', '#open_sidebar', (e) => {
	browser.sidebarAction.setPanel({ 
		panel: browser.runtime.getURL("../panels/manage.html"),
		windowId: windowId
	});
	

	browser.sidebarAction.open();

});

addEvent('click', '#test', (e) => {
	console.log(browser.sidebarAction);
/*	console.log(browser.sidebarAction.getPanel({}).then((e)=>console.log(e)));
	console.log(browser.sidebarAction.getTitle({}).then((e)=>console.log(e)));
	
	browser.sidebarAction.getPanel({}).then((e)=>browser.sidebarAction.setPanel({panel: e}))
*/	
	
	browser.sidebarAction.close().then(() => {
		openSidebar();
	});
	browser.sidebarAction.open();
});


function reload_sessions_table(sessions)
{
	document.querySelector('#sessions_table > tbody').remove();
	document.querySelector('#sessions_table').createTBody();
	
	sessions.sessions.forEach((sess, sId) => {
		let row = document.querySelector('#sessions_table > tbody').insertRow(-1);
		row.insertCell(-1).appendChild( document.createTextNode(sess.category));
		row.insertCell(-1).appendChild( document.createTextNode(sess.name));
		row.insertCell(-1).appendChild( document.createTextNode(sess.color));
		let actionCell = row.insertCell(-1);
		actionCell.dataset.sessionId = sId;
		
		if(sessions.pages['w_'+windowId] == undefined || sessions.pages['w_'+windowId] != sId)
		{
			actionCell.innerHTML = actionCell.innerHTML + "<button class=\"add_window\">add</button>";
		}
		else
		{
			actionCell.innerHTML = actionCell.innerHTML + "<button class=\"remove_window\">remove</button>";
		}
	});
}