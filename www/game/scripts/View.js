O2.createObject('View', {
	/**
	 * handler de redimensionnement d'ecran
	 * gère les element de classe full-height pour qu'il ne depassent pas
	 * le bas de l'ecran
	 */
	resizeScreen: function() {
		$('.full-height').each(function(i, oItem) {
			var $item = $(oItem);
			var nTop = $item.offset().top;
			$item.height(innerHeight - nTop - 32);
		});
	},
	
	/**
	 * Affichage d'une chainde de caractère dans la fenetre terminal
	 * @param s string contenu de la chaine à acheter.
	 */
	termPrint: function(s) {
		var $term = $('#ik-terminal');
		if ($term.length == 0) {
			return;
		}
		var $input = $('.command', $term);
		$input.detach();
		var $line = $('<div class="chat-line">' + s + '</div>');
		$term.append($line);
		$term.append($input);
		$input.get(0).scrollIntoView();
	},
	
	/**
	 * Défini le contenu (affichage) de la liste des utilisateur connectés
	 * @param Array tableau des utilisateurs connecté
	 */
	setUserList: function(aUsers) {
		var $list = $('#ik-user-list');
		$list.empty();
		aUsers.forEach(function(u) {
			$list.append('<div class="user">' + u + '</div>');
		});
	},

	/**
	 * Défini le contenu (affichage) de la liste des canaux ouvert sur le canal
	 * @param Array tableau des cannaux ouverts
	 */
	setChanList: function(aChans) {
		var $list = $('#ik-chan-list');
		$list.empty();
		aChans.forEach(function(c) {
			$list.append('<div class="chan">' + c + '</div>');
		});
	},
	
	
	/**
	 * Affichage d'un popup
	 * @param xContent contenu directement appendé au popup
	 */
	popup: function(xContent) {
		var $popup = $('.popup');
		if ($popup.length === 0) {
			$popup = $('<div class="popup"></div>');
			$('body').append($popup).one('mousedown', function() {
				$popup.remove();
			});			
		}
		$popup.empty().append(xContent);
	},

	/**
	 * Popup Error
	 * @param err contenu de l'erreur
	 */
	error: function(err) {
		View.popup('<h2>Error</h2><div>' + err + '</div>');
	},

	showSection: function(sSection) {
		$('section.tab').hide();
		$('section.tab.' + sSection).show();
	}
});
