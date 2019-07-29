/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

// Displays a multi-step button, whose contents change depending on how many steps have
// been taken.
//
// For now, the steps are simply hard-coded for creating a new lists; but in the future,
// this might be made into a more generalized button for multi-step interaction.
//
export function CreateNewListButton(props = {})
{
    CreateNewListButton.validate_props(props);

    const [stepsCompleted, setStepsCompleted] = React.useState(0);

    React.useEffect(()=>
    {
        switch (stepsCompleted)
        {
            case 1: setTimeout(()=>setStepsCompleted(2), 8500); break; /* TODO: Send a request to the server to create a new list.*/
        }
    }, [stepsCompleted]);

    // For each step the elements to be displayed inside the button.
    const stepsElements =
    [
        <div>Luo uusi lista</div>,

        <div>
            <i className="fas fa-spinner fa-spin fa-lg" style={{marginLeft:"-16px",marginRight: "16px"}}/>
            Luodaan uutta listaa, odotahan...
        </div>,

        <div>
            <i className="fas fa-link fa-lg" style={{marginLeft:"-16px",marginRight: "16px"}}/>
            Luotiin uusi lista. <a href="#">Nappaa linkki talteen</a>
        </div>
    ];

    return <div className="CreateNewListButton">
                <div className={`button step-${stepsCompleted+1}`}
                     onClick={()=>setStepsCompleted(Math.max(1, stepsCompleted))}>
                         {stepsElements[stepsCompleted] || <></>}
                </div>
           </div>
}

CreateNewListButton.validate_props = function(props)
{
    return;
}
