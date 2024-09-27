let windowId = null;
let globalSessions = null;

document.addEventListener("DOMContentLoaded", (e) => {
	browserManager.init_style();
	hideForms();

	storage.get_sessions().then((sessions) => {
		browser.tabs.query({currentWindow: true}).then((tabs) => {
			windowId = tabs[0].windowId;
			reload_sessions_table(sessions);
		});
	});
});

document.querySelector('#debug').addEventListener('click', (e) => {
	storage.get_sessions().then((sessions) => {
		console.log(sessions);
	});
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

addEvent('click', '#add_session', (e) => {
	let form = document.querySelector('#form_add_session');

	form.querySelector('input[name="name"]').value = "";
	form.querySelector('input[name="category"]').value = "";
	form.querySelector('input[name="color"]').value = "";
	showForm(form);
});

addEvent('click', '#form_add_session button.submit', (e) => {
	e.preventDefault();
	let form = document.querySelector('#form_add_session');
	let formdata = new FormData(form);
	storage.add_session(formdata.get('name'),formdata.get('color'),formdata.get('category')).then((sessions) => {
		reload_sessions_table(sessions);
	});
	hideForms();
});

addEvent('click', '.edit_session', (e) => {
	let myId = e.target.closest('td').dataset.sessionId;
	let form = document.querySelector('#form_edit_session');

	form.querySelector('input[name="id"]').value = myId;
	form.querySelector('input[name="name"]').value = globalSessions.sessions[myId].name;
	form.querySelector('input[name="category"]').value = globalSessions.sessions[myId].category;
	form.querySelector('input[name="color"]').value = globalSessions.sessions[myId].color;
	showForm(form);
});

addEvent('click', '#form_edit_session button.submit', (e) => {
	e.preventDefault();
	let form = document.querySelector('#form_edit_session');
	let formdata = new FormData(form);
	storage.edit_session(formdata.get('id'), formdata.get('name'),formdata.get('color'),formdata.get('category')).then((sessions) => {
		reload_sessions_table(sessions);
	});
	hideForms();
});

addEvent('click', '#close_forms', (e) => {
	hideForms();
});

addEvent('click', '.remove_session', (e) => {
	storage.delete_session(e.target.closest('td').dataset.sessionId).then((sessions) => {
		reload_sessions_table(sessions);
	});
});

function reload_sessions_table(sessions)
{
	globalSessions = sessions;

	document.querySelector('#sessions_table > tbody').remove();
	document.querySelector('#sessions_table').createTBody();

	for (const [sId, sess] of Object.entries(sessions.sessions))
	{
		let row = document.querySelector('#sessions_table > tbody').insertRow(-1);
		row.insertCell(-1).appendChild( document.createTextNode(sess.category));
		row.insertCell(-1).appendChild( document.createTextNode(sess.name));
		let actionCell = row.insertCell(-1);
		actionCell.dataset.sessionId = sId;
		row.style.backgroundColor = sess.color;
		row.style.color = invertColor(sess.color, false);

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
	}
}

function showForm(form)
{
	document.querySelector('#forms').style.display = "block";
	document.querySelector('#form_add_session').style.display = "none";
	document.querySelector('#form_edit_session').style.display = "none";
	form.style.display = "block";
}

function hideForms()
{
	document.querySelector('#forms').style.display = "none";
	document.querySelector('#form_add_session').style.display = "none";
	document.querySelector('#form_edit_session').style.display = "none";
}