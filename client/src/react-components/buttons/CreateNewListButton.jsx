/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {backend_access} from "../../backend-access.js";
import {is_defined} from "../../assert.js";

// Displays a multi-step button, whose contents change depending on how many steps have
// been taken.
//
// For now, the steps are simply hard-coded for creating a new lists; but in the future,
// this might be made into a more generalized button for multi-step interaction.
//
export function CreateNewListButton(props = {})
{
    CreateNewListButton.validate_props(props);

    const [currentStep, setCurrentStep] = React.useState("1");

    // When the server has created a new list and sent us the keys, they will be stored here.
    const [newListKeys, setNewListKeys] = React.useState(0);

    React.useEffect(()=>
    {
        if (newListKeys)
        {
            if ((currentStep === "2") &&
                is_defined(newListKeys.editKey) &&
                is_defined(newListKeys.viewKey))
            {
                setCurrentStep("3");
            }
            else
            {
                setCurrentStep("fail");
            }
        }
    }, [newListKeys])

    React.useEffect(()=>
    {
        switch (currentStep)
        {
            case "2":
            {
                (async()=>
                {
                    const keys = await backend_access.create_new_list();
                    
                    if (keys)
                    {
                        setNewListKeys(keys);
                    }
                    else
                    {
                        setCurrentStep("fail");
                    }
                })();

                break;
            }
            case "3":
            {
                if (!is_defined(newListKeys.editKey) ||
                    !is_defined(newListKeys.viewKey))
                {
                    setCurrentStep("fail");
                }

                break;
            }
            default: break;
        }
    }, [currentStep]);

    // For each step the elements to be displayed inside the button.
    const stepElements =
    {
        "1":
            <div>Luo uusi lista</div>,

        "2":
            <div>
                <i className="fas fa-spinner fa-spin fa-lg" style={{marginLeft:"-16px",marginRight: "16px"}}/>
                Luodaan uutta listaa, odotahan...
            </div>,

        "3":
            <div>
                <i className="fas fa-dove fa-lg" style={{marginLeft:"-16px",marginRight: "16px"}}/>
                Luotiin uusi lista! Nappaa <a href={`./muokkaa/${newListKeys.editKey}`}
                                              target="_blank"
                                              rel="noopener noreferrer">linkki</a> talteen.
            </div>,

        "fail":
            <div>
                <i className="fas fa-times fa-lg" style={{marginLeft:"-16px",marginRight: "16px"}}/>
                Uutta listaa ei voitu luoda!
            </div>,
    };

    return <div className="CreateNewListButton">
                <div className={`button step-${currentStep}`}
                     onClick={()=>{if (currentStep === "1") setCurrentStep("2")}}>
                         {stepElements[currentStep] || <></>}
                </div>
           </div>
}

CreateNewListButton.validate_props = function(props)
{
    return;
}
