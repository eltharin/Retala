let windowId = null;
let filters = {};

document.addEventListener("DOMContentLoaded", (e) => {
	browserManager.init_style();

	storage.get_sessions().then((sessions) => {
		/*browser.tabs.query({currentWindow: true}).then((tabs) => {
			windowId = tabs[0].windowId;
			reload_sessions_table(sessions);
		});
*/

		browserManager.get_window_id().then((newWindowId) => {
			console.log(newWindowId)
			windowId = newWindowId;


			reload_sessions_table(sessions);

		});

	});
});

addEvent('click', '.add_window', (e) => {
	storage.add_window_to_session(windowId, e.target.closest('td').dataset.sessionId).then((sessions) => {
		reload_sessions_table(sessions);
	});
});

addEvent('click', '.remove_window', (e) => {
	storage.remove_window_from_session(windowId, e.target.closest('td').dataset.sessionId).then((sessions) => {
		reload_sessions_table(sessions);
	});
});

addEvent('click', '#open_sidebar', (e) => {
	browser.sidebarAction.setPanel({ 
		panel: browser.runtime.getURL("../panels/manage.html"),
		windowId: windowId
	});
	

	browser.sidebarAction.open();
	window.close();
});

addEvent('change', '#select_session', (e) => {
	if(e.eventTarget.value == '')
	{
		storage.remove_window_from_session(windowId).then((sessions) => {});
	}
	else
	{
		storage.add_window_to_session(windowId, e.eventTarget.value).then((sessions) => {});
	}

	e.eventTarget.style.backgroundColor = e.eventTarget.options[e.eventTarget.selectedIndex].style.backgroundColor;
	e.eventTarget.style.color = e.eventTarget.options[e.eventTarget.selectedIndex].style.color;
});

addEvent('change', '#sessions_table > thead > .filters #filter_categories', (e) => {
	for (row of document.querySelectorAll('#sessions_table > tbody > tr'))
	{
		row.classList.toggle("filteredCategory", !(e.eventTarget.value == '' || e.eventTarget.value == row.dataset.category));
	}
});

addEvent('input', '#sessions_table > thead > .filters #filter_names', (e) => {
	for (row of document.querySelectorAll('#sessions_table > tbody > tr'))
	{
		row.classList.toggle("filteredName", !(e.eventTarget.value == '' || row.dataset.session.includes(e.eventTarget.value)));
	}
});



function reload_sessions_table(sessions)
{
	document.querySelector('#sessions_table > tbody').remove();
	document.querySelector('#sessions_table').createTBody();

	let filterSelectCategory = document.querySelector('#sessions_table > thead > .filters #filter_categories');

	for (opt of filterSelectCategory.querySelectorAll('option'))
	{
		opt.remove();
	}

	const emptyOptionC = document.createElement("option");
	emptyOptionC.value = "";
	emptyOptionC.text = "Choose";
	filterSelectCategory.add(emptyOptionC, null);

	filters = filter.get_filters(sessions.sessions);

	for (const category of Object.values(filters).sort((a, b) => a.name.localeCompare(b.name)))
	{
		const optionc = document.createElement("option");
		optionc.value = category.name;
		optionc.text = category.name;
		filterSelectCategory.add(optionc, null);

		for (const [sId, sess] of Object.entries(category.sessions).sort((a, b) => a[1].name.localeCompare(b[1].name)))
		{
			let row = document.querySelector('#sessions_table > tbody').insertRow(-1);
			row.insertCell(-1).appendChild( document.createTextNode(sess.category));
			row.insertCell(-1).appendChild( document.createTextNode(sess.name));
			let actionCell = row.insertCell(-1);
			actionCell.dataset.sessionId = sId;
			row.style.backgroundColor = sess.color;
			row.style.color = invertColor(sess.color, false);
			row.dataset.category = sess.category;
			row.dataset.session = sess.name;

			if(sessions.pages['w_'+windowId] == undefined || sessions.pages['w_'+windowId] != sId)
			{
				actionCell.innerHTML = actionCell.innerHTML + "<button class=\"add_window\">+</button>";
			}
			else
			{
				actionCell.innerHTML = actionCell.innerHTML + "<button class=\"remove_window\">-</button>";
			}
		}
	}
}
