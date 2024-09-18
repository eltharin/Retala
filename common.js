function addEvent(eventName, elementSelector, handler)
{
	document.addEventListener(eventName, function(e) {
		for (var target = e.target; target && target != this; target = target.parentNode)
		{
			if (target.matches(elementSelector))
			{
				e.eventTarget = target;
				handler.call(target, e);
				break;
			}
		}
	}, false);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}