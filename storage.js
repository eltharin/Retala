

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
	}
		
	static async delete_session(sessionId)
	{
		const sessions = await this.#loadsessions();
		
		
		
		await this.#savesessions(sessions);
	}
	
	static async add_window_to_session(sessionId, windowId)
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
	
	static async remove_window_from_session(sessionId, windowId)
	{
		const sessions = await this.#loadsessions();
		
		if(sessions.pages['w_'+windowId] !== undefined)
		{
			this.#internal_remove_window_from_session(sessions, sessionId, windowId);
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
		};
		
		mySession.etat = 'C';
		
		await this.#savesessions(sessions);
		
		return sessions;
	}
	
	static async open_session_windows(sessionId)
	{
		const sessions = await this.#loadsessions();
		
		let mySession = sessions.sessions[sessionId];
		console.log(mySession);
		
		for (const page of Object.values(mySession.pages)) 
		{
			//delete sessions.sessions[sessionId].pages['w_'+page.windowId];
			
			console.log(page);
			console.log(page.tabs[0]);
			console.log(page.tabs == []);

			if(page.tabs.length > 0)
			{
				let urls = [];
				
				page.tabs.forEach((tab) => {
					urls.push(tab.url);
				});

				let windowInfo = await browser.windows.create({
					url: urls,
				});

				console.log(windowInfo)
				await this.#internal_add_window_from_session(sessions, sessionId, windowInfo.id);
				
				
				/*console.log(creating)
				
				creating.then((windowInfo) => {
					console.log(windowInfo)
					this.#internal_add_window_from_session(sessionId, windowInfo.id);
				});
				creating.finally((windowInfo) => {
					console.log(windowInfo)
					this.#internal_add_window_from_session(sessionId, windowInfo.id);
				});*/
				
				page.tabs = [];
			}
		}
		
		mySession.etat = 'O';
		
		await this.#savesessions(sessions);
		
		return sessions;
	}
	
	static async open_window()
	{
			/*		(async () => {
				console.log(await browser.windows.create({
				url: urls,
			}));
			})();*/
			console.log('start');
			await sleep(2000);
			console.log('end');
	}
	
	static #internal_create_session(sessions, name, color, category)
	{	
		let myId = sessions.sessions.length;
		
		console.log(sessions.sessions.length);
		
		sessions.sessions[myId] = {name: name, color: color, category: category, etat: 'O', pages: []};
		console.log(sessions);
	}
	
	static #internal_add_window_from_session(sessions, sessionId, windowId)
	{
		console.log(sessions);
		console.log(sessionId);
		sessions.pages['w_'+windowId] = sessionId;
		console.log(sessions);
		sessions.sessions[sessionId].pages['w_'+windowId] = {id: sessionId, windowId: windowId, tabs: []};
		
		browser.browserAction.setBadgeText({text: sessions.sessions[sessionId].name, windowId: windowId });
		browser.browserAction.setBadgeBackgroundColor({'color': sessions.sessions[sessionId].color , windowId: windowId });
		
		return sessions;
	}
	
	static #internal_remove_window_from_session(sessions, sessionId, windowId)
	{
		delete sessions.pages['w_'+windowId];
		delete sessions.sessions[sessionId].pages['w_'+windowId];
		browser.browserAction.setBadgeText({text: null, windowId: windowId });
	}
	
	static async #loadsessions(key = null)
	{
		let sessions = await browser.storage.local.get(key);
		
		if(sessions.sessions == undefined)
		{
			sessions.sessions = [];
			
			sessions.sessions[0] = {name: 'session 1', color: 'blue', category: 'toto', etat: 'O',  pages: {}};
			sessions.sessions[1] = {name: 'session 2', color: 'red', category: 'toto', etat: 'O', pages: {}};
			this.#internal_create_session(sessions, 'sess 3', 'green', 'tutu');
		}
		if(sessions.pages == undefined)
		{
			sessions.pages = {};
		}
	
		return sessions;
	}
	
	static #savesessions(objects)
	{
		return browser.storage.local.set(objects);
	}
}

storage.init();