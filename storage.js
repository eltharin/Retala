

class storage
{
	static async init()
	{
		/*console.log("init");
		browser.storage.local.clear();

		const sessions = await this.#loadsessions();
		console.log(sessions);
		
		sessions.sessions[0] = {name: 'session 1', color: 'blue', category: 'toto', etat: 'O',  pages: []};
		sessions.sessions[1] = {name: 'session 2', color: 'red', category: 'toto', etat: 'O', pages: []};
		this.#internal_create_session(sessions, 'sess 3', 'green', 'tutu');
		
		await this.#savesessions(sessions);*/
	}


	static async get_sessions()
	{
		const sessions = await this.#loadsessions();
		return sessions;
	}


	static async add_session(name, color, category)
	{
		const sessions = await this.#loadsessions();

		this.#internal_create_session(sessions, name, color, category)

		await this.#savesessions(sessions);

		return sessions;
	}

	static async edit_session(id, name, color, category)
	{
		const sessions = await this.#loadsessions();
		console.log(sessions.sessions)
		console.log(id)
		sessions.sessions[id].name = name;
		sessions.sessions[id].color = color;
		sessions.sessions[id].category = category;

		for(const window of Object.values(sessions.sessions[id].pages))
		{
			console.log(window)
			browserManager.iconColorTabs(window.windowId, sessions.sessions[id]);
		}

		await this.#savesessions(sessions);

		return sessions;
	}
		
	static async delete_session(sessionId)
	{
		const sessions = await this.#loadsessions();

		let mySession = sessions.sessions[sessionId];

		if (mySession.etat == 'O')
		{
			for(const window of Object.values(mySession.pages))
			{
				this.#internal_remove_window_from_session(sessions, sessionId, window.windowId);
			}

			delete sessions.sessions[sessionId];
		}

		await this.#savesessions(sessions);

		return sessions;
	}
	
	static async add_window_to_session(windowId, sessionId)
	{
		const sessions = await this.#loadsessions();
		
		if(sessions.pages['w_'+windowId] !== undefined)
		{
			this.#internal_remove_window_from_session(sessions, sessionId, windowId);
		}
		
		this.#internal_add_window_from_session(sessions, sessionId, windowId);

		await this.#savesessions(sessions);
		
		return sessions;
	}
	
	static async remove_window_from_session(windowId, sessionId = null)
	{
		const sessions = await this.#loadsessions();
		
		if(sessions.pages['w_'+windowId] !== undefined)
		{
			this.#internal_remove_window_from_session(sessions, sessionId ?? sessions.pages['w_'+windowId], windowId);
		}

		await this.#savesessions(sessions);
		
		return sessions;
	}
	
	static async close_session_windows(sessionId)
	{
		const sessions = await this.#loadsessions();
		
		let mySession = sessions.sessions[sessionId];
		console.log(mySession);
		
		for (let page of Object.values(mySession.pages)) 
		{
			let tabs = await browser.tabs.query({windowId: page.windowId});
			
			console.log(tabs, tabs.length)
			if(tabs.length > 0) 
			{
				tabs.forEach((tab) => {
					console.log(page.windowId , tab.windowId)
					if(page.windowId == tab.windowId) //-- verif pour pas tout fermer 
					{
						page.tabs.push({title: tab.title, url: tab.url});
						browser.tabs.remove(tab.id);
					}
				});
			}
			else
			{
				delete sessions.sessions[sessionId].pages['w_'+page.windowId];
			}
	
			delete sessions.pages['w_'+page.windowId];
		}
		
		mySession.etat = 'C';
		
		await this.#savesessions(sessions);
		
		return sessions;
	}
	
	static async open_session_windows(sessionId)
	{
		const sessions = await this.#loadsessions();
		
		let mySession = sessions.sessions[sessionId];

		for (const page of Object.values(mySession.pages)) 
		{
			if(page.tabs.length > 0)
			{
				let urls = [];

				let windowInfo = null;

				for (const tab of Object.values(page.tabs))
				{
					if(windowInfo == null)
					{
						windowInfo = await browser.windows.create({url: tab.url}).catch(e => console.error("impossible d ouvrir la page : " + e));
					}
					else
					{
						browser.tabs.create({
							url: tab.url,
							windowId: windowInfo.id
						}).catch(e => console.error("impossible d ouvrir la page : " + e));
					}
				}

				if(windowInfo != null)
				{
					await this.#internal_add_window_from_session(sessions, sessionId, windowInfo.id);
				}
				sessions.sessions[sessionId].pages['w_'+page.windowId].tabs = [];
			}
		}
		
		mySession.etat = 'O';
		
		await this.#savesessions(sessions);
		
		return sessions;
	}

	static #internal_create_session(sessions, name, color, category)
	{	
		let myId = uuidv4();
		sessions.sessions[myId] = {name: name, color: color, category: category, etat: 'O', pages: []};
	}
	
	static #internal_add_window_from_session(sessions, sessionId, windowId)
	{
		sessions.pages['w_'+windowId] = sessionId;
		console.log(sessionId)
		console.log(windowId)
		sessions.sessions[sessionId].pages['w_'+windowId] = {id: sessionId, windowId: windowId, tabs: []};

		browserManager.iconColorTabs(windowId, sessions.sessions[sessionId]);

		
		return sessions;
	}
	
	static #internal_remove_window_from_session(sessions, sessionId, windowId)
	{
		delete sessions.pages['w_'+windowId];
		delete sessions.sessions[sessionId].pages['w_'+windowId];
		browserManager.iconClear(windowId);
	}
	
	static async #loadsessions(key = null)
	{
		let sessions = await browser.storage.local.get(key);
		let heveToSave = false;

		if(sessions.sessions == undefined)
		{
			sessions.sessions = {};
			
			sessions.sessions[uuidv4()] = {name: 'session 1', color: '#0000FF', category: 'toto', etat: 'O',  pages: {}};
			sessions.sessions[uuidv4()] = {name: 'session 2', color: '#FF0000', category: 'toto', etat: 'O', pages: {}};
			this.#internal_create_session(sessions, 'sess 3', '#00FF00', 'tutu');
			heveToSave = true;
		}
		if(sessions.pages == undefined)
		{
			sessions.pages = {};
			heveToSave = true;
		}

		if(heveToSave)
		{
			await this.#savesessions(sessions);
		}

		return sessions;
	}
	
	static #savesessions(objects)
	{
		return browser.storage.local.set(objects);
	}
}

storage.init();