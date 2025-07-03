if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
	  navigator.serviceWorker.register('/sw.js')
		.then(registration => {
		  console.log('Service Worker registered with scope:', registration.scope);
		})
		.catch(error => {
		  console.log('Service Worker registration failed:', error);
		});
	});
  }

(function($) {

	var	$window = $(window),
		$body = $('body'),
		$sidebar = $('#sidebar');

	// Breakpoints.
		breakpoints({
			xlarge:   [ '1281px',  '1680px' ],
			large:    [ '981px',   '1280px' ],
			medium:   [ '737px',   '980px'  ],
			small:    [ '481px',   '736px'  ],
			xsmall:   [ null,      '480px'  ]
		});

	// Hack: Enable IE flexbox workarounds.
		if (browser.name == 'ie')
			$body.addClass('is-ie');

	// Play initial animations on page load.
		$window.on('load', function() {
			window.setTimeout(function() {
				$body.removeClass('is-preload');
			}, 100);
		});

	// Forms.

		// Hack: Activate non-input submits.
			$('form').on('click', '.submit', function(event) {

				// Stop propagation, default.
					event.stopPropagation();
					event.preventDefault();

				// Submit form.
					$(this).parents('form').submit();

			});

	// Sidebar.
		if ($sidebar.length > 0) {

			var $sidebar_a = $sidebar.find('a');

			$sidebar_a
				.addClass('scrolly')
				.on('click', function() {

					var $this = $(this);

					// External link? Bail.
						if ($this.attr('href').charAt(0) != '#')
							return;

					// Deactivate all links.
						$sidebar_a.removeClass('active');

					// Activate link *and* lock it (so Scrollex doesn't try to activate other links as we're scrolling to this one's section).
						$this
							.addClass('active')
							.addClass('active-locked');

				})
				.each(function() {

					var	$this = $(this),
						id = $this.attr('href'),
						$section = $(id);

					// No section for this link? Bail.
						if ($section.length < 1)
							return;

					// Scrollex.
						$section.scrollex({
							mode: 'middle',
							top: '-20vh',
							bottom: '-20vh',
							initialize: function() {

								// Deactivate section.
									$section.addClass('inactive');

							},
							enter: function() {

								// Activate section.
									$section.removeClass('inactive');

								// No locked links? Deactivate all links and activate this section's one.
									if ($sidebar_a.filter('.active-locked').length == 0) {

										$sidebar_a.removeClass('active');
										$this.addClass('active');

									}

								// Otherwise, if this section's link is the one that's locked, unlock it.
									else if ($this.hasClass('active-locked'))
										$this.removeClass('active-locked');

							}
						});

				});

		}

	// Scrolly.
		$('.scrolly').scrolly({
			speed: 1000,
			offset: function() {

				// If <=large, >small, and sidebar is present, use its height as the offset.
					if (breakpoints.active('<=large')
					&&	!breakpoints.active('<=small')
					&&	$sidebar.length > 0)
						return $sidebar.height();

				return 0;

			}
		});

	// Spotlights.
		$('.spotlights > section')
			.scrollex({
				mode: 'middle',
				top: '-10vh',
				bottom: '-10vh',
				initialize: function() {

					// Deactivate section.
						$(this).addClass('inactive');

				},
				enter: function() {

					// Activate section.
						$(this).removeClass('inactive');

				}
			})
			.each(function() {

				var	$this = $(this),
					$image = $this.find('.image'),
					$img = $image.find('img'),
					x;

				// Assign image.
					$image.css('background-image', 'url(' + $img.attr('src') + ')');

				// Set background position.
					if (x = $img.data('position'))
						$image.css('background-position', x);

				// Hide <img>.
					$img.hide();

			});

	// Features.
		$('.features')
			.scrollex({
				mode: 'middle',
				top: '-20vh',
				bottom: '-20vh',
				initialize: function() {

					// Deactivate section.
						$(this).addClass('inactive');

				},
				enter: function() {

					// Activate section.
						$(this).removeClass('inactive');

				}
			});

	// --- PWA Install Button: Mobile Only, Animated ---
	(function() {
		const btn = document.getElementById('pwa-install-btn');
		const confettiContainer = document.getElementById('pwa-confetti');
		let deferredPrompt = null;

		// Utility: Detect mobile
		function isMobile() {
			return window.matchMedia('(max-width: 768px)').matches;
		}

		// Utility: Detect if app is installed
		function isAppInstalled() {
			return (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true);
		}

		function hideBtn() {
			btn.style.display = 'none';
			btn.classList.remove('glow', 'floating', 'animated');
			btn.querySelector('.pwa-shimmer').style.display = 'none';
		}

		// Hide button if app is already installed
		function visibilityCheck() {
			if (isAppInstalled()) {
				hideBtn();
			}
		}
		// Initial check
		visibilityCheck();
		document.addEventListener('visibilitychange', visibilityCheck);
		window.addEventListener('resize', visibilityCheck);

		// Confetti burst
		function confettiBurst() {
			if (!confettiContainer) return;
			const colors = ['#4f8cff', '#a084ee', '#f9d423', '#ff4e50'];
			for (let i = 0; i < 24; i++) {
				const piece = document.createElement('div');
				piece.className = 'pwa-confetti-piece';
				piece.style.left = (50 + Math.random() * 40 - 20) + 'vw';
				piece.style.top = (60 + Math.random() * 10 - 5) + 'vh';
				piece.style.background = `linear-gradient(135deg, ${colors[i%colors.length]}, #fff)`;
				piece.style.transform = `rotate(${Math.random()*360}deg)`;
				piece.style.animationDuration = (0.9 + Math.random()*0.7) + 's';
				confettiContainer.appendChild(piece);
				setTimeout(() => piece.remove(), 1400);
			}
		}

		// Show button only on mobile and when installable, for 10 seconds
		window.addEventListener('beforeinstallprompt', (e) => {
			if (!isMobile() || isAppInstalled()) return;
			e.preventDefault();
			deferredPrompt = e;
			btn.style.display = 'flex';
			btn.classList.add('animated', 'glow', 'floating');
			btn.querySelector('.pwa-shimmer').style.display = 'block';
			setTimeout(() => btn.classList.remove('animated'), 900);
			// Hide after 10 seconds if not clicked
			clearTimeout(btn._hideTimeout);
			btn._hideTimeout = setTimeout(() => {
				hideBtn();
			}, 10000);
		});

		// Button click: show prompt, animate, confetti, ripple
		btn.addEventListener('click', async function(e) {
			if (!deferredPrompt) return;
			btn.classList.add('animated');
			setTimeout(() => btn.classList.remove('animated'), 900);
			clearTimeout(btn._hideTimeout);
			btn.classList.remove('glow', 'floating');
			btn.querySelector('.pwa-shimmer').style.display = 'none';
			// Ripple effect
			const ripple = document.createElement('span');
			ripple.className = 'pwa-ripple';
			btn.appendChild(ripple);
			setTimeout(() => ripple.remove(), 350);
			deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			if (outcome === 'accepted') {
				hideBtn();
				confettiBurst();
			}
			deferredPrompt = null;
		});

		// Micro-interaction: bounce on tap/hover
		btn.addEventListener('touchstart', () => {
			btn.classList.add('animated');
			setTimeout(() => btn.classList.remove('animated'), 700);
		});
		btn.addEventListener('mouseenter', () => {
			btn.classList.add('animated');
			setTimeout(() => btn.classList.remove('animated'), 700);
		});

		// Hide on desktop resize
		window.addEventListener('resize', () => {
			if (!isMobile()) {
				hideBtn();
			}
		});

		// Hide after install (for some browsers)
		window.addEventListener('appinstalled', () => {
			hideBtn();
			confettiBurst();
		});
	})();

})(jQuery);