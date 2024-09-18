let windowId = null;

document.addEventListener("DOMContentLoaded", (e) => {
	storage.get_sessions().then((sessions) => {
		browser.tabs.query({currentWindow: true}).then((tabs) => {
			windowId = tabs[0].windowId;
			reload_sessions_table(sessions);
		});
	});
});
document.querySelector('#get').addEventListener('click', (e) => {
	console.log('click get');
	browser.storage.local.get().then((e) => console.log(e), (e) => console.log(e));
	
	let windows = [];
	
	browser.tabs.query({}).then((tabs) => {
      tabs.forEach((tab) => {
		  windows[tab.windowId] = '1';
	  });
    });
	
	console.log(windows)
});

addEvent('click', '.close_window', (e) => {
	storage.close_session_windows(e.target.closest('td').dataset.sessionId).then((sessions) => {
		reload_sessions_table(sessions);
	});
});


addEvent('click', '.open_window', (e) => {
	storage.open_session_windows(e.target.closest('td').dataset.sessionId).then((sessions) => {
		reload_sessions_table(sessions);
	});
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
		
		actionCell.innerHTML = actionCell.innerHTML + "<button class=\"edit_session\">edit</button>";
		actionCell.innerHTML = actionCell.innerHTML + "<button class=\"remove_session\">remove</button>";
		
		if(sess.etat == 'O')
		{
			actionCell.innerHTML = actionCell.innerHTML + "<button class=\"close_window\">close</button>";
		}
		else
		{
			actionCell.innerHTML = actionCell.innerHTML + "<button class=\"open_window\">open</button>";
		}
	});
}