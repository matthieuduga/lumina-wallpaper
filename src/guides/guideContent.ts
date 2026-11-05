export interface GuideStep {
  title: string;
  description: string;
  command?: string;
  tip?: string;
}

export interface OsGuide {
  osName: string;
  iconName: string;
  summary: string;
  steps: GuideStep[];
  notes?: string;
}

export const OS_GUIDES: Record<string, { en: OsGuide; fr: OsGuide }> = {
  mac: {
    en: {
      osName: 'macOS (Sequoia, Sonoma, Ventura)',
      iconName: 'Apple',
      summary: 'Easily set up your wallpapers on Mac — fully automated and native.',
      steps: [
        {
          title: 'Step 1: Set Dynamic Wallpaper (1-Click)',
          description:
            'Right-click the downloaded .HEIC (or PNG) file in Finder and select "Set Desktop Picture". Your wallpaper will update immediately.',
        },
        {
          title: 'Step 2: Confirm Dynamic Mode in Settings',
          description:
            'Open Apple menu  > System Settings > Wallpaper. Make sure the wallpaper style is set to "Dynamic" (or "Auto"). Your Mac will automatically transition between light capsules by day and dark capsules at night!',
          tip: 'The embedded Apple metadata (apple_desktop:apr) syncs perfectly with macOS scheduled appearance.',
        },
        {
          title: 'Step 3: Multi-Monitor Support',
          description:
            'If you use multiple external displays (e.g., Studio Display, Pro Display XDR), select each display at the top of System Settings > Wallpaper to apply the dynamic wallpaper to all of them.',
        },
        {
          title: 'Optional: Static Mode',
          description:
            'If you prefer a static permanent appearance, download the dedicated Light or Dark PNG and set it directly via Finder.',
        },
      ],
      notes: 'No external scripts or software installations are needed. Generated 100% in your browser.',
    },
    fr: {
      osName: 'macOS (Sequoia, Sonoma, Ventura)',
      iconName: 'Apple',
      summary: 'Installez facilement vos fonds d\'écran sur Mac — 100% natif et sans aucun script.',
      steps: [
        {
          title: 'Étape 1 : Activer en 1 clic via le Finder',
          description:
            'Faites simplement un clic droit sur le fichier .HEIC (ou PNG) téléchargé dans votre Finder, puis choisissez « Définir comme image de bureau ». Le fond d\'écran s\'applique immédiatement.',
        },
        {
          title: 'Étape 2 : Confirmer l\'apparence dynamique',
          description:
            'Ouvrez le menu Pomme  > Réglages Système > Fond d\'écran. Vérifiez que l\'affichage est sur « Dynamique » (ou « Auto »). Votre Mac basculera automatiquement sur les capsules claires le jour et les capsules sombres la nuit !',
          tip: 'Les métadonnées officielles Apple (apple_desktop:apr) intégrées assurent une synchronisation parfaite avec l\'apparence système.',
        },
        {
          title: 'Étape 3 : Gestion multi-écrans',
          description:
            'Si vous utilisez plusieurs moniteurs externes (Studio Display, etc.), sélectionnez chaque écran dans les Réglages Système > Fond d\'écran pour appliquer votre création sur tous vos bureaux.',
        },
        {
          title: 'Optionnel : Mode fixe (PNG)',
          description:
            'Si vous souhaitez garder une apparence permanente (par exemple mode sombre en continu), faites un clic droit sur le PNG correspondant > « Définir comme image de bureau ».',
        },
      ],
      notes: 'Aucun script ni outil tiers n\'est requis. Le fichier est généré 100% localement dans votre navigateur.',
    },
  },

  iphone: {
    en: {
      osName: 'iOS (iPhone 15, 16 & earlier)',
      iconName: 'Smartphone',
      summary: 'Transfer and apply your wallpaper on iOS.',
      steps: [
        {
          title: '1. Transfer the image',
          description:
            'Download the wallpaper directly on your iPhone, or AirDrop the PNG from your computer to your iPhone.',
        },
        {
          title: '2. Open in Photos app',
          description:
            'Open the Photos app, locate the wallpaper, and tap the Share button (square with arrow up).',
        },
        {
          title: '3. Set as Wallpaper',
          description:
            'Tap "Use as Wallpaper". Turn OFF perspective zoom (pinch slightly to fit) so the capsules remain centered and sharp.',
          tip: 'You can customize widgets and clock fonts on the Lock Screen, then tap "Add" and "Set as Wallpaper Pair".',
        },
      ],
      notes: 'For optimal results on OLED displays, the rich dark backgrounds turn off pixels for deep contrast and battery savings.',
    },
    fr: {
      osName: 'iOS (iPhone 15, 16 et antérieurs)',
      iconName: 'Smartphone',
      summary: 'Transférez et appliquez votre fond d\'écran sur iOS.',
      steps: [
        {
          title: '1. Transférer l\'image',
          description:
            'Téléchargez directement le fichier depuis Safari sur votre iPhone, ou envoyez-le par AirDrop depuis votre Mac.',
        },
        {
          title: '2. Ouvrir dans Photos',
          description:
            'Ouvrez l\'application Photos, touchez le fond d\'écran, puis le bouton Partager (icône de carré avec flèche).',
        },
        {
          title: '3. Utiliser comme fond d\'écran',
          description:
            'Sélectionnez "Utiliser en fond d\'écran". Désactivez le zoom de perspective (pincez légèrement l\'image pour cadrer) afin de conserver un centrage parfait.',
          tip: 'Personnalisez vos widgets et la typographie de l\'heure, puis appuyez sur "Ajouter" > "Définir comme paire de fonds d\'écran".',
        },
      ],
      notes: 'Sur les écrans OLED des iPhone récents, le noir profond éteint les pixels pour une autonomie optimale.',
    },
  },

  ipad: {
    en: {
      osName: 'iPadOS (iPad Pro, Air, mini)',
      iconName: 'Tablet',
      summary: 'Apply wallpapers for both portrait and landscape orientation on iPad.',
      steps: [
        {
          title: '1. Save to Photos',
          description: 'Save the generated high-resolution PNG to the Photos app.',
        },
        {
          title: '2. Apply via Settings or Photos',
          description:
            'Go to Settings > Wallpaper > Add New Wallpaper, or open the image in Photos and tap "Use as Wallpaper".',
          tip: 'Rotate your iPad to check framing in both Portrait and Landscape orientations before tapping Done.',
        },
      ],
    },
    fr: {
      osName: 'iPadOS (iPad Pro, Air, mini)',
      iconName: 'Tablet',
      summary: 'Appliquez votre fond d\'écran en mode portrait et paysage sur iPad.',
      steps: [
        {
          title: '1. Enregistrer dans Photos',
          description: 'Enregistrez le PNG haute résolution dans l\'application Photos.',
        },
        {
          title: '2. Appliquer depuis Réglages ou Photos',
          description:
            'Allez dans Réglages > Fond d\'écran > "Ajouter un nouveau fond d\'écran", ou touchez "Utiliser en fond d\'écran" dans Photos.',
          tip: 'Faites pivoter votre iPad pour vérifier le cadrage en mode Portrait et Paysage avant de valider.',
        },
      ],
    },
  },

  pc: {
    en: {
      osName: 'Windows 11 / 10',
      iconName: 'Monitor',
      summary: 'Configure wallpaper on Windows desktop.',
      steps: [
        {
          title: '1. Right-click desktop',
          description: 'Right-click an empty area on your desktop and select "Personalize".',
        },
        {
          title: '2. Choose Background',
          description:
            'Click on "Background" > "Browse photos", and select your downloaded PNG wallpaper.',
          tip: 'Under "Choose a fit for your desktop image", select "Fill" or "Fit".',
        },
        {
          title: '3. Optional: Automatic Light/Dark switching',
          description:
            'Windows does not natively change wallpaper with system dark mode. To enable automatic switching, you can use the free open-source tool "WinDynamicDesktop" (available on Microsoft Store / GitHub).',
        },
      ],
    },
    fr: {
      osName: 'Windows 11 / 10',
      iconName: 'Monitor',
      summary: 'Configurez votre fond d\'écran sur Windows.',
      steps: [
        {
          title: '1. Clic droit sur le Bureau',
          description: 'Faites un clic droit sur votre bureau et sélectionnez "Personnaliser".',
        },
        {
          title: '2. Choisir l\'Arrière-plan',
          description:
            'Cliquez sur "Arrière-plan" > "Parcourir les photos", puis choisissez le fichier PNG téléchargé.',
          tip: 'Dans "Choisir un ajustement", sélectionnez "Remplir" ou "Ajuster".',
        },
        {
          title: '3. Astuce : bascule automatique jour/nuit',
          description:
            'Windows ne bascule pas le fond d\'écran selon le thème clair/sombre nativement. Pour cela, l\'application open-source gratuite "WinDynamicDesktop" (sur le Microsoft Store ou GitHub) permet d\'automatiser le changement.',
        },
      ],
    },
  },

  android: {
    en: {
      osName: 'Android (Pixel, Galaxy & others)',
      iconName: 'Smartphone',
      summary: 'Set wallpaper on Android devices.',
      steps: [
        {
          title: '1. Save to Gallery / Google Photos',
          description: 'Download the PNG directly onto your device.',
        },
        {
          title: '2. Set via Wallpaper settings',
          description:
            'Long-press on an empty spot on your Home screen and tap "Wallpaper & style", or open the image in Google Photos > "Use as" > "Wallpaper".',
          tip: 'You can choose to set it for Home screen, Lock screen, or both.',
        },
      ],
    },
    fr: {
      osName: 'Android (Pixel, Galaxy et autres)',
      iconName: 'Smartphone',
      summary: 'Appliquez le fond d\'écran sur votre appareil Android.',
      steps: [
        {
          title: '1. Télécharger dans la Galerie',
          description: 'Téléchargez le PNG directement sur votre smartphone.',
        },
        {
          title: '2. Définir via le menu Fond d\'écran',
          description:
            'Appuyez longuement sur une zone vide de l\'écran d\'accueil > "Fond d\'écran et style", ou ouvrez l\'image dans Google Photos > "Utiliser comme" > "Fond d\'écran".',
          tip: 'Vous pouvez appliquer l\'image à l\'écran de verrouillage, à l\'écran d\'accueil, ou aux deux.',
        },
      ],
    },
  },

  linux: {
    en: {
      osName: 'Linux (GNOME / KDE / Sway)',
      iconName: 'Terminal',
      summary: 'Command-line and graphical setup for Linux desktops.',
      steps: [
        {
          title: 'GNOME 42+ Dual Theme (Light & Dark)',
          description:
            'GNOME natively supports separate light and dark backgrounds via gsettings commands:',
          command:
            'gsettings set org.gnome.desktop.background picture-uri "file:///path/to/Pills_light.png"\ngsettings set org.gnome.desktop.background picture-uri-dark "file:///path/to/Pills_dark.png"',
        },
        {
          title: 'KDE Plasma',
          description:
            'Right-click desktop > Configure Desktop and Wallpaper > click "Add Image" and select your wallpaper.',
        },
      ],
    },
    fr: {
      osName: 'Linux (GNOME / KDE / Sway)',
      iconName: 'Terminal',
      summary: 'Configuration graphique ou en ligne de commande sous Linux.',
      steps: [
        {
          title: 'GNOME 42+ Double Thème (Clair & Sombre)',
          description:
            'GNOME prend en charge nativement des fonds d\'écran distincts pour le mode clair et le mode sombre via gsettings :',
          command:
            'gsettings set org.gnome.desktop.background picture-uri "file:///chemin/vers/Pills_light.png"\ngsettings set org.gnome.desktop.background picture-uri-dark "file:///chemin/vers/Pills_dark.png"',
        },
        {
          title: 'KDE Plasma',
          description:
            'Clic droit sur le bureau > "Configurer le bureau et le fond d\'écran" > "Ajouter une image".',
        },
      ],
    },
  },
};
