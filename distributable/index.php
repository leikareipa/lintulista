<!DOCTYPE html>
<html>
    <head>
        <title>Lintulista!</title>
        <meta name="viewport" content="width=device-width">
        <meta http-equiv="content-type" content="text/html; charset=UTF-8">
        <link href="https://fonts.googleapis.com/css?family=Nunito|Delius|Beth+Ellen&display=swap" rel="stylesheet"> 
        <link rel="stylesheet"
              href="https://use.fontawesome.com/releases/v5.6.1/css/all.css"
              integrity="sha384-gfdkjb5BdAXd+lj+gudLWI+BXq4IuLW5IT+brZEZsLFm++aCMlF1V92rMkPaX4PP"
              crossorigin="anonymous">
        <link rel="stylesheet" type="text/css" href="./css/index.css">
        <link rel="stylesheet" type="text/css" href="./css/view-animations.css">
        <link rel="stylesheet" type="text/css" href="./css/index-responsive.css">
    </head>
    <body>
        <header>
            
            <div id="app-title" style="white-space: nowrap;">
                <span id="app-name">
                    lintulista
                    <i class="fas fa-feather-alt fa-sm" style="transform: translateY(-17px) translateX(-20px); z-index: 2;"></i>
                </span>
            </div>

            <div class="app-menu">
                <div class="app-menu-item"><a href="./guide/" target="_blank" rel="noopener noreferrer">käyttöohje</a></div>
                <div class="app-menu-item"><a href="mailto:sw@tarpeeksihyvaesoft.com">yhteydenotto</a></div>
            </div>
            
        </header>

        <div id="content">
            <!-- A list of random bird observation cards. -->
            <div id="random-observations" style="overflow: hidden; display: flex; flex-direction: row; justify-content: center;">
                <?php
                    // It takes a bit of time to load bird data from the backend etc., so
                    // let's insert placeholder cards to take up visual space while the
                    // actual data is on its way.

                    $numPlaceholderCards = 30;

                    for ($i = 0; $i < $numPlaceholderCards; $i++)
                    {
                        echo "<div class='ObservationCard'>".
                             "   <img class='BirdThumbnail'".
                             "        referrerPolicy='no-referrer'".
                             "        src='./img/placeholder-bird-thumbnail.png'>".
                             "   <div class='observation-info'>".
                             "       <div class='bird-name' style='color:transparent'>".
                             "           ...".
                             "       </div>".
                             "       <div class='date' style='color:transparent'>".
                             "            ...".
                             "       </div>".
                             "   </div>".
                             "</div>";
                    }
                ?>
            </div>
            <div id="create-new-list"></div>
        </div>

        <div id="info">
            <div class="entry">
                <div class="title">Mihin Lintulistaa käytetään?</div>
                <div class="text">
                    <p>Lintulistalla pidät kätevästi kirjaa eri lintulajien ensihavainnoistasi.</p>
                    <p>Pääset tarkastelemaan tekemiäsi lajihavaintoja kuvallisesta listasta havaintopäivämäärän
                    tai lajin nimen mukaan järjesteltynä.</p>
                    <p>Lintulista on taulukko-ohjelmaa mielenkiintoisempi tapa pysyä kartalla havainnoistaan!</p>
                </div>
            </div>
            <div class="entry">
                <div class="title">Mitä käyttäjältä vaaditaan?</div>
                <div class="text">
                    <p>Lintulistan käyttö on ilmaista; tarvitset vain modernin nettiselaimen.</p>
                    <p>Voit luoda itsellesi yhden tai useamman listan, jonka jälkeen pääset
                    merkitsemään havaintojasi.</p>
                    <p>Voit vaikkapa luoda erillisen listan kutakin linturetkeä
                    varten sekä pitää pidempiaikaisempaa listaa koko vuoden ensihavaintojen merkitsemiseen.</p>
    
                </div>
            </div>
            <div class="entry">
                <div class="title">Miten käytän Lintulistaa?</div>
                <div class="text">
                    <p>Kun olet luonut itsellesi listan (kts. sininen nappi, yllä), järjestelmä ilmoittaa sinulle
                    linkin, jonka kautta pääset muokkaamaan listaa.</p>
                    <p>Mutta ennen kuin luot uuden listan, luethan tarkoin Lintulistan käyttöohjeet, joihin löydät linkin
                    sivun ylälaidan valikosta.</p>
                    <p>Huomaathan, että listaan antamasi tiedot ovat julkisia. Tietojen saatavuutta ei voida taata.</p>
                </div>
            </div>
            <div class="entry">
                <div class="title">Kuka teki Lintulistan?</div>
                <div class="text">
                    <p>Lintulistan on kirjoittanut suomalainen koodiluola <a href="https://www.tarpeeksihyvaesoft.com">Tarpeeksi Hyvae Soft</a>.
                    <p>Lintulistassa käytetyillä lintukuvilla on useita tekijöitä. Löydät täyden listan <a href="./guide/images.html">tästä</a>.
                    <p>Lintulista on avointa lähdekoodia - löydät sen myös
                    <a href="https://www.github.com/leikareipa/lintulista">GitHubista</a>.</p>
                </div>
            </div>
        </div>

        <footer>
            <a href="https://www.github.com/leikareipa/lintulista">Lintulista</a>
            &bull; Designed & developed by <a href="https://www.tarpeeksihyvaesoft.com">Tarpeeksi Hyvae Soft</a> 2019
            &bull; Includes photos taken by <a href="./guide/images.html">a variety of authors</a>
        </footer>

        <script src="./js/react/react.js"></script>
        <script src="./js/react/react-dom.js"></script>
        <script type="module">
            import {ObservationCard} from "./js/react-components/observation-list/ObservationCard.js"
            import {CreateNewListButton} from "./js/react-components/buttons/CreateNewListButton.js";
            import {BackendAccess} from "./js/backend-access.js";
            import {Observation} from "./js/observation.js";
            
            // Run the app.
            (async()=>
            {
                // Render a button with which the user can create a new list.
                {
                    const container = document.getElementById("create-new-list");

                    if (!container)
                    {
                        panic("Can't find the required container!");
                    }
                    else
                    {
                        ReactDOM.render(React.createElement(CreateNewListButton), container);
                    }
                }

                render_random_observation_cards();
            })();

            const resizeTimer = {timeout: 200};
            let prevWindowWidth = window.innerWidth;
            window.onresize = ()=>
            {
                // The list of random observation cards is dependent on window size,
                // so update it when the window resizes.
                {
                    // Only update the list if the window is now bigger than it was
                    // previously and if that size difference exceeds a threshold.
                    if (prevWindowWidth &&
                        ((window.innerWidth - prevWindowWidth) < 400))
                    {
                        return;
                    }

                    prevWindowWidth = window.innerWidth;

                    if (!resizeTimer.handle)
                    {
                        resizeTimer.handle = setTimeout(async()=>
                        {
                            await render_random_observation_cards();
                            
                            resizeTimer.handle = null;
                        }, resizeTimer.timeout);
                    }
                }
            }

            // Render a random selection of observations. (In the future, we might draw
            // a random sample from user-submitted observations, but for now, since there
            // are very few of those, we just generate random observations on the spot.)
            async function render_random_observation_cards()
            {
                const knownBirds = await BackendAccess.get_known_birds_list();

                if (knownBirds.length)
                {
                    // Assumed (approximate) width in pixels of a single observation card element.
                    const cardPixelWidth = 200;

                    const numPlaceholderCards = <?php echo $numPlaceholderCards ?>;
                    const numCardsFitInViewport = (Math.floor(window.innerWidth / cardPixelWidth) + 1);

                    // There's (we assume) an even number of placeholder cards, so to properly
                    // horizontally align the real cards on top of the placeholder cards, we
                    // want an even number of real cards also.
                    if ((numPlaceholderCards < 2) ||
                        (numPlaceholderCards % 2) != 0)
                    {
                        window.alert("WARNING: Expected there to be an even number of placeholder cards.");
                    }
                    const numCardsToDraw = Math.min(numPlaceholderCards, (2 + Math.floor(numCardsFitInViewport / 2) * 2));

                    const randomObservations = Array(numCardsToDraw).fill().reduce((cardArray, card, idx)=>
                    {
                        const randomDate = (()=>
                        {
                            const date = new Date();
                            date.setDate(Math.floor(Math.random() * 31));
                            date.setMonth(Math.floor(Math.random() * 12));

                            return date;
                        })();

                        cardArray.push(React.createElement(ObservationCard,
                        {
                            key: idx,
                            observation: Observation(
                            {
                                date: randomDate,
                                bird: (()=>
                                {
                                    let bird;
                                    let loopCount = 0;
                                    const maxNumLoops = 1000;

                                    do
                                    {
                                        bird = knownBirds[Math.floor(Math.random() * knownBirds.length)];
                                    }
                                    while ((bird.thumbnailUrl === bird.nullThumbnailUrl) ||
                                        cardArray.map(c=>c.props.observation.bird.species).includes(bird.species) &&
                                        (++loopCount < maxNumLoops));

                                    return bird;
                                })(),
                            }),
                        }));

                        return cardArray;
                    }, []);

                    const container = document.getElementById("random-observations");

                    if (!container)
                    {
                        panic("Can't find the required container!");
                    }
                    else
                    {
                        ReactDOM.unmountComponentAtNode(container)
                        ReactDOM.render(randomObservations, container);
                    }
                }
            }
        </script>
    </body>
</html>