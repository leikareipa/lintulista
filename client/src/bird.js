/*
 * 2019 Tarpeeksi Hyvae Soft
 * Lintulista
 * 
 */

"use strict";

import {panic_if_not_type} from "./assert.js";

export function Bird(args = {})
{
    panic_if_not_type("object", args);
    panic_if_not_type("string", args.species, args.family, args.order);

    // The generic image to be displayed for this bird's thumbnail if no specific image
    // URL was provided.
    const nullThumbnailUrl = "./client/assets/images/null-bird-thumbnail.png";

    if (!args.thumbnailUrl)
    {
        args.thumbnailUrl = nullThumbnailUrl;
    }

    const publicInterface = Object.freeze(
    {
        order: args.order,
        family: args.family,
        species: args.species,
        thumbnailUrl: args.thumbnailUrl,
        nullThumbnailUrl
    });
    
    return publicInterface;
}

// For each known bird in Lintulista, a corresponding thumbnail filename. The files
// referenced are found in "server/assets/images/bird-thumbnails/".
Bird.thumbnailFilename =
{
    "Metsäviklo":"0005609d-4f41-4fa5-9ad9-ea8c0a4bafe5.jpg",
    "Sininärhi":"017ea8ee-b6e8-48a8-b54c-6b38fac7c198.jpg",
    "Mustajalkatylli":"01c07c55-6f92-46f8-99f0-dbbe19120547.jpg",
    "Idänuunilintu":"01d41caa-8144-44a7-b81e-f79566498919.jpg",
    "Pikkuruokki":"033c8cee-2925-4abb-8f43-09f68185fb8d.jpg",
    "Mustanmerenlokki":"0395fd59-6850-4259-a741-2e163a0c9b7e.jpg",
    "Kiinanriisihaikara":"039a94cb-36cd-4f95-a610-bf6f674abadb.jpg",
    "Mustaleppälintu":"03aa75aa-972e-442a-b92c-166523c2baf9.jpg",
    "Nokisiipilokki":"04d1730c-8d15-4b0c-a012-36dca0e2b930.jpg",
    "Kurki":"05e13e86-48db-4b83-91c2-694b467bc961.jpg",
    "Pikkusieppo":"06172952-d9a9-4677-a527-debad441840b.jpg",
    "Lapintiira":"061bf229-cfe4-45d5-a11a-732c85d523e0.jpg",
    "Pikkukotka":"0699e935-2617-47b9-bac0-3ebc061ca611.jpg",
    "Mustapääsirkku":"06b217c0-d986-4250-af37-8a6f7157cf6b.jpg",
    "Kaspiantylli":"074fbda8-d117-4fae-928c-d8f226f00298.jpg",
    "Nuolihaukka":"0776e91a-f513-43fe-a20b-4397ca159cbb.jpg",
    "Amerikansirri":"09856c26-87a9-45e7-8a7f-8f074a7235ea.jpg",
    "Merihanhi":"0a615977-dc9b-47be-af8e-2b0fc17e89ce.jpg",
    "Iberiantiltaltti":"1021e5a4-0fd2-4fcc-8fd8-320a39b72d25.jpg",
    "Harmaalokki":"12156393-7229-492a-bbd5-4c403e85e262.jpg",
    "Keltasirkku":"12836c31-d31a-41d6-8c3f-ba2e492e0e40.jpg",
    "Sirppisorsa":"128e1445-faff-4579-8848-601910a10d3e.jpg",
    "Patagonianhaapana":"12ee0187-f3b1-47a7-a483-6671f86d78cc.jpg",
    "Heinäkurppa":"131c18ca-4c2a-4482-807d-5b8b3ff3eddf.jpg",
    "Tunturikihu":"134aa56b-9dc8-4fb8-8616-cbd049376cb7.jpg",
    "Pikkupajusirkku":"1540b6e8-02c8-425f-bab2-7b84b155f989.jpg",
    "Lapinkirvinen":"1573584b-e315-4107-9adc-6c0f20ac6b52.jpg",
    "Nokiliitäjä":"158be652-c92b-41ac-86b1-0d56d45c1d20.jpg",
    "Lunni":"15a9e7c5-ed81-4c3e-8101-55e218806419.jpg",
    "Pitkäjalka":"15ef46ec-1c7e-4617-a688-5f20928c2cbb.jpg",
    "Kaukasianuunilintu":"16b58940-8254-4e6c-b2b8-201872ccf5b7.jpg",
    "Telkkä":"17df4469-586c-4dbd-b6a9-d5c0b0c00d63.jpg",
    "Pyrstötiainen":"18a0746a-19c8-4b8f-9fd6-b73230a744c1.jpg",
    "Aavikkotylli":"1a12374c-3284-4150-bac2-e01a9a710ded.jpg",
    "Laulujoutsen":"1a2f4c5e-103b-42f7-9a6b-46031ffd313f.jpg",
    "Hanhikorppikotka":"1a5cafef-b7c1-41d0-afb5-b29a221e69ad.jpg",
    "Isokihu":"1bf9140f-5674-4c55-8c4b-a704beaa9950.jpg",
    "Peltosirkku":"1c0df0f9-d653-43c5-a7be-b1e3ff0680f2.jpg",
    "Jakobiinikäki":"1c3d31f6-6af1-4432-be1f-f5cd205c4fff.jpg",
    "Lapintiainen":"1c86ff0a-7da7-4b15-8117-dcba3d39c9f1.jpg",
    "Merilokki":"1ee66cc3-ac83-425b-a45b-5b85bbccf2cd.jpg",
    "Hemppo":"1f68cc3c-3c0f-4908-a419-081b666724f5.jpg",
    "Vaaleakiitäjä":"20fbb744-4d6e-456b-ac4d-96278d1788f1.jpg",
    "Sepeltasku":"2315ce52-4760-4dd8-a5ff-dc9f20e20220.jpg",
    "Arohyyppä":"24aa74d6-aee4-41cd-a487-91316509ed1a.jpg",
    "Isohaarahaukka":"25e700a6-1d1d-44bf-833e-506cd41a4a3b.jpg",
    "Räkättirastas":"269441ce-09be-4578-87a1-e0227fed50eb.jpg",
    "Rantakurvi":"270b3a71-88c5-4d6e-8a02-52f55dd67d91.jpg",
    "Aavikkotasku":"2802cf80-e970-4541-bd45-bdbce89518f9.jpg",
    "Ohotanlokki":"28c7e4e7-f928-4ecf-8cdd-ffdd3f3c481e.jpg",
    "Mustajoutsen":"290eaeac-7c56-4ebd-a82e-8ccdbbef3f3f.jpg",
    "Suosirri":"298ea96d-af66-42bc-b874-a15160b7a7e9.jpg",
    "Kanahaukka":"2a63276b-6de2-48ce-bb3d-ca66d4c5e0b1.jpg",
    "Taigakirvinen":"2ab8c17f-0f9b-4878-ab95-5a5450359b77.jpg",
    "Idänkäki":"2d918d59-3712-4923-b89b-ab60c3fbe788.jpg",
    "Varis":"2f400d3c-ebdf-4bec-b994-669264cf05b4.jpg",
    "Balkaninuunilintu":"2f42a6c1-795f-47d4-9286-f4d25ad8ba31.jpg",
    "Rautiainen":"30a16f40-399c-46f6-8869-e14e0409c150.jpg",
    "Vuorihemppo":"30a1f126-d50d-4b43-9dff-7d386cda9caf.jpg",
    "Peltopyy":"30b6af32-304f-47ad-8779-f536d5795bd9.jpg",
    "Tundrakurppelo":"31ee1d83-2c27-4af4-b019-1eab71be019e.jpg",
    "Leveäpyrstökihu":"3270521e-0aba-43d3-9004-bdfaf797c99d.jpg",
    "Amerikantaivaanvuohi":"3465a717-627f-45c4-9af8-26726f04d970.jpg",
    "Siperianuunilintu":"3559a2b7-91f1-4c95-b2c9-3496492ddb49.jpg",
    "Taviokuurna":"37503183-7d7f-4854-a471-15b71efdd6e4.jpg",
    "Kuikka":"37e4d382-f7af-464e-96fc-3aad807f240e.jpg",
    "Töyhtöhyyppä":"37fc1097-1c88-4af9-9373-9539f70220ad.jpg",
    "Ristisorsa":"391eb5ef-1f82-4545-af2d-edeb710aff48.jpg",
    "Pikkukultarinta":"393979af-567d-47e3-bc49-cf0c736ee16b.jpg",
    "Isolepinkäinen":"3abac210-9559-4c32-9142-aa16d4480477.jpg",
    "Sinirastas":"3b347438-5fb3-4bb3-8cd1-ac7dc6648ec2.jpg",
    "Samettipääkerttu":"3c72fcaf-a538-4007-a6eb-1ab9260937c3.jpg",
    "Ruokki":"3caee14e-54a1-43c4-9d33-e4a2a75c22b9.jpg",
    "Tammitikka":"3cc5f338-1479-4eac-85bd-54765c304701.jpg",
    "Arotasku":"3dae1512-5ff3-45f8-ba52-a1305332a2b6.jpg",
    "Ylänkötylli":"3df2fe9a-71ff-4138-a95c-e559b44f54e6.jpg",
    "Sitruunahemppo":"3f1d3175-4ee2-445f-9dfd-ace31ce7731a.jpg",
    "Isovesipääsky":"40d4caad-4457-4bf9-ac7c-c7c33bf14065.jpg",
    "Sinisiipitavi":"4336a764-5254-434a-91dc-f72a654893eb.jpg",
    "Riskilä":"44624d2e-dbe7-433d-ac47-e46f55ecf2de.jpg",
    "Viherpeippo":"446d1b76-322f-46fe-b9d2-4fa10f4a87b2.jpg",
    "Rusotasku":"44846f51-bc49-46e5-9e85-3f6f6351d442.jpg",
    "Kyhmyjoutsen":"44b87cc7-21ed-4b7d-9001-284b3b7f1986.jpg",
    "Töyhtötiainen":"46092f33-8fa6-4b81-8bba-d83ccf293492.jpg",
    "Mandariinisorsa":"4844f999-9a7a-4a5c-8b7b-27bdc1b37925.jpg",
    "Rantasipi":"48cb7c7a-3d76-4d71-a5f8-d946789f8ade.jpg",
    "Kuparisorsa":"49555318-a511-42c4-8f99-bafd9dd8ac02.jpg",
    "Allihaahka":"49999d89-a0e2-4334-b0dd-51a9604c7efc.jpg",
    "Sirittäjä":"4a777737-7ff8-4de7-af91-aa3fba80ad6f.jpg",
    "Peukaloinen":"4b50aeb7-2e24-4bab-a1e2-6455d7708c0e.jpg",
    "Punajalkaviklo":"4cd8dde0-7d7a-4809-bd31-8d54795f1760.jpg",
    "Suokukko":"502a59f7-6cb2-45d0-b1b3-c695b038f875.jpg",
    "Sarasirkkalintu":"508881a9-d4c6-4164-988f-4442053eebc6.jpg",
    "Palmukyyhky":"50bfc4b6-0c5d-4ac1-a5af-0738dc24af70.jpg",
    "Ruskosotka":"50c9396e-9968-41e9-99fc-1947c71935de.jpg",
    "Kalalokki":"519741ec-24de-4da7-81d0-df4cf3784556.jpg",
    "Valkokurkkusirkku":"522db27e-5525-4fb3-9ee1-839d88f847a1.jpg",
    "Alli":"53d4e2bd-cbf8-4aa5-ac39-b5ab946e73cf.jpg",
    "Rusokaulasirri":"5425fe15-7327-4435-af17-524083c47728.jpg",
    "Arosuohaukka":"54f2eed0-00f4-47ee-803a-c9d7597828c5.jpg",
    "Lehtokurppa":"5530ff8e-3a58-4a67-9e1f-2655d28f4305.jpg",
    "Pikkukiuru":"57ae6458-f533-4c3f-9bff-e6e94702a12e.jpg",
    "Hiiripöllö":"57e395c8-d590-477f-ba66-e895a042f76c.jpg",
    "Sinitiainen":"588e4c18-670b-4cfe-9fd5-525736c8b23d.jpg",
    "Keräkurmitsa":"5b48457c-8f33-4d5b-a727-5c15223caadf.jpg",
    "Mustakaularastas":"5b6dec58-1375-4b09-aa5f-26f57f1acc33.jpg",
    "Minervanpöllö":"5cf6cf9e-47e7-4877-8513-72fd5ce1c8f9.jpg",
    "Turkoosikardinaali":"5f51ff41-e818-4976-a45d-983cc0ccdc78.jpg",
    "Pensasvarpunen":"5fdaf640-1970-4ea7-9406-9cb11674b12f.jpg",
    "Talitiainen":"6020a608-114e-4c44-a2b5-9524102047d8.jpg",
    "Tikli":"609f4c2e-a6bc-445b-8330-d80bf98671da.jpg",
    "Ruisrääkkä":"614541a5-5f79-4abd-b372-1beb15932ba3.jpg",
    "Sääksi":"618f1456-f282-46c4-ab69-a4ba18f8638b.jpg",
    "Käpytikka":"61b8d56d-b44a-4588-a07f-574ff4f8c0d1.jpg",
    "Tornipöllö":"61e9bcc6-a6eb-460d-9998-88a5ba976eb2.jpg",
    "Viitakerttunen":"6285e109-409e-48f6-91f9-16e46ec79bd9.jpg",
    "Punajalkahaukka":"64ed2feb-bce8-4432-8f7f-1d36ddee94d9.jpg",
    "Punatavi":"67e4f5fc-93cf-494d-9f4b-4883da05b2ba.jpg",
    "Valkoviklo":"6969304c-ee9a-4101-a5b0-397a04e460c4.jpg",
    "Kulorastas":"69874835-cdd0-47e8-ad58-7cac99aa0da7.jpg",
    "Amerikanvesipääsky":"6b7c943d-4023-4c45-bca3-042e042cc9de.jpg",
    "Savannihaikara":"6d0caa07-2848-4bb7-841b-f0a348ea4063.jpg",
    "Töyhtökiuru":"6d9e3a97-62ba-4947-9bfd-7faeb12e7d1d.jpg",
    "Pensassirkkalintu":"6eac426c-f53d-40a5-8986-5b49b530a0a7.jpg",
    "Viirukerttuli":"6f01bada-25f2-4ec9-8c4b-72e4237f8610.jpg",
    "Suopöllö":"6f45d69f-9b3c-41c3-948d-a19d483b7500.jpg",
    "Idänpikkusieppo":"6fbe209d-af63-4d04-8623-803de1e303de.jpg",
    "Tiltaltti":"6ff42c43-d129-404a-a50d-3f8a8f9829e4.jpg",
    "Arohiirihaukka":"708435be-8927-4bff-9361-8591316cde41.jpg",
    "Sateenkaarikardinaali":"70a2b3be-a133-4ae5-8f83-bdad4b600e36.jpg",
    "Kiljukotka":"70c72867-8259-4a99-99d9-02cff6fc152e.jpg",
    "Järripeippo":"71afd21f-a3dc-4153-a59f-17e6da4c65e1.jpg",
    "Ruostekurkkusirkku":"71ff1064-5f91-41b4-8a8c-713267fcb13f.jpg",
    "Pulmussirri":"72620123-583c-4bf2-89a3-9d30b052bccf.jpg",
    "Kaulushaikara":"7323b9ba-fb75-44cc-b024-fb9ef176bce7.jpg",
    "Gobintylli":"733ffa85-0ace-441a-89af-19001a377aa1.jpg",
    "Myrskylintu":"7370c08f-6157-4c6b-a708-05c5ab12af39.jpg",
    "Kenttäkerttunen":"73a25cdb-ea44-483f-96d5-1bc763b21293.jpg",
    "Pikkukajava":"73c950fa-65e5-4ff9-94b1-78100057c2ea.jpg",
    "Lapinsirri":"764c1ca7-9bd3-4574-9c98-25fe7ca333de.jpg",
    "Viiksitimali":"78b4f110-0623-4b9b-9998-9d93220f31bc.jpg",
    "Aasianpääskykahlaaja":"78c29b09-4f55-484f-9b58-a1c6f24a8aa5.jpg",
    "Leppälintu":"795b6874-4114-4acd-b244-8e45f21030ff.jpg",
    "Pikkukanadanhanhi":"7abe85d6-eba2-4fb7-b08e-737112dc50bc.jpg",
    "Mustahaikara":"7aeff25d-e2f3-4b15-8d03-d96c70eba432.jpg",
    "Niittykirvinen":"7d603fc6-89db-44e8-91d0-426a945c585f.jpg",
    "Merikihu":"7e32a63c-5d97-4d3c-a6a8-a700817293ec.jpg",
    "Harmaapääsirkku":"7e35b3f2-696d-4e8a-a45c-85ec0e82316f.jpg",
    "Valkoperäsirri":"803c9f73-e56f-4355-b278-861397af0bcd.jpg",
    "Uuttukyyhky":"820f0b3e-03f9-4775-959f-031ece6c1851.jpg",
    "Laulurastas":"8237a581-95fd-4107-900d-e0693957af93.jpg",
    "Riekko":"84519899-e616-427e-8658-26a2481bb567.jpg",
    "Pikkutylli":"846a2c9e-2269-4dff-b3a2-7f1183561208.jpg",
    "Tiiralokki":"84f284a2-f7a8-41a5-a3be-db0274be30f9.jpg",
    "Pähkinähakki":"853b5ad1-7a20-466d-b49a-5a7df2f18d28.jpg",
    "Preerianaurulokki":"85569b62-98f1-4ed1-b59d-d7ef27c28546.jpg",
    "Tundrakurmitsa":"867c779f-7c5d-407b-b67d-01577bc15d73.jpg",
    "Selkälokki":"86efbd97-b800-4636-b1fc-36cb8105671c.jpg",
    "Rubiinisatakieli":"87e89a30-6a8c-4110-adec-8650f0d42f1a.jpg",
    "Mehiläishaukka":"884f02ee-cb0e-4978-a054-f15330c2dd51.jpg",
    "Tulipäähippiäinen":"88ca6f91-8a15-4e72-a5cf-77054da09391.jpg",
    "Ruskokerttu":"89941086-cd90-498c-9df0-af8bf08eb70a.jpg",
    "Valko-otsalepinkäinen":"8a308ef7-9da6-4882-9186-2fc7085b982b.jpg",
    "Sepelsieppo":"8a89850f-6053-4752-90f7-859fca7cf05e.jpg",
    "Kääpiökerttu":"8a94f9d9-d2b2-49c3-ad9c-83a3a2beea1c.jpg",
    "Meriharakka":"8ace85be-c85a-46be-885c-76031f8199b7.jpg",
    "Aavikkokultarinta":"8b039b53-5fc3-48e8-a876-9cff68fe2556.jpg",
    "Korpirastas":"8c0aa398-1c92-4bc0-abee-4530dc9782d8.jpg",
    "Viiriäinen":"8c2b140a-1366-44eb-9a6e-d58bb29bfd99.jpg",
    "Vihermehiläissyöjä":"8c71c5cf-1960-496e-b7c0-1f2d2f526a33.jpg",
    "Käenpiika":"8c7a9b2c-0cc9-437a-bd59-7948d29c53d1.jpg",
    "Mustakurkkurautiainen":"8d3fa6a8-6ff6-4731-984e-42f15e22f248.jpg",
    "Harmaahaikara":"8e49db4b-c7e6-4cc3-ac17-713926c76392.jpg",
    "Valkoselkätikka":"8e70ace9-faf2-434b-a323-04b3856de684.jpg",
    "Harmaasirkku":"8f27b4bd-d8cf-401a-a1ee-ebdae28a7e5b.jpg",
    "Puukiipijä":"8f5ff4a4-b565-4928-a182-da35f4ea9746.jpg",
    "Arokyyhky":"8f9dfdbe-2b0e-48e3-8a37-3e9e58c8ee22.jpg",
    "Isokirvinen":"901cfbc2-7393-417c-bbdb-ce89b238ace4.jpg",
    "Isokäpylintu":"903813c4-2440-4671-981c-1ea66e7fdcc7.jpg",
    "Sinirinta":"925584f9-32da-4e1d-8ea1-b6532bbb645b.jpg",
    "Ruskohaikara":"9357fe4a-95e0-4d94-a40e-8f2b34e3ab2b.jpg",
    "Mustapääkerttu":"95a53bd4-36cd-4238-8e7f-b29983432f42.jpg",
    "Turturikyyhky":"95fc31f7-e5ff-4faa-838a-d94cf55d64fa.jpg",
    "Kaitanokkalokki":"96bc79b6-599c-4276-bea8-f18ce784d10f.jpg",
    "Amerikansipi":"96dd67e6-6585-4376-bf29-ab42f8441f5f.jpg",
    "Paksunokkakerttunen":"985f6da9-3337-43a6-b29f-a48148090492.jpg",
    "Lapasotka":"99491d9f-5d44-45f3-b201-59a1116f220d.jpg",
    "Mustalintu":"999bf46b-2e3d-4395-9a35-c42a55525856.jpg",
    "Mäntysirkku":"99ae4360-548b-4f03-9b96-13627c821779.jpg",
    "Luotokirvinen":"99e2fcd1-a764-40f9-8915-ca4907880627.jpg",
    "Pikkutuulihaukka":"9a075abc-77cb-4e5b-8d42-ed00264d59c9.jpg",
    "Punakuiri":"9b0fdb55-dff1-4f4d-b515-427a91d4a47e.jpg",
    "Afrikanhanhi":"9cfdbf0f-daf5-4176-b47b-ec7bfaa1bfa0.jpg",
    "Viirupääkottarainen":"9d4bf727-2845-4aa8-ac7a-c5bf6ca439cf.jpg",
    "Pajusirkku":"9db77359-192b-41d7-b319-a1e6f6d81dac.jpg",
    "Pikkusirkku":"9defe795-1587-4290-b318-29c3c7523322.jpg",
    "Silkkihaikara":"9e440c11-270d-4f2d-88d3-8bc9114ca16e.jpg",
    "Mongoliankirvinen":"9e5940ab-ca22-493e-b3e4-a0393cb442a3.jpg",
    "Kivitasku":"9ee62722-36f6-4d0d-ad1b-17ec353fdb6e.jpg",
    "Keltavästäräkki":"a05245e0-f5dd-4e25-8fa7-bd4773cc6823.jpg",
    "Rusorintakerttu":"a20f411a-c65d-4bfc-a771-7bfeea35b4b5.jpg",
    "Sinisorsa":"a25b9db5-eefc-4830-a2e5-eebc7e05bd13.jpg",
    "Käärmekotka":"a31047d5-dbae-4061-b10a-d98f28089263.jpg",
    "Mustakiuru":"a39ed6b7-f557-4aee-a8fd-dbe985c40d9b.jpg",
    "Yöhaikara":"a4136b5c-7489-4854-ba56-8634df134dee.jpg",
    "Kultarinta":"a4196f1a-6347-4c87-bba6-5bd1ceadd633.jpg",
    "Punakottarainen":"a4a74c2f-de87-49ae-89af-9d59cda42010.jpg",
    "Vuorileppälintu":"a53e57fa-cd91-4310-b9e0-234c659e0dc5.jpg",
    "Virtavästäräkki":"a5824fd0-7173-4a60-986b-4679230f6a09.jpg",
    "Karikukko":"a5c5ada5-9346-4643-a90f-75a17e916594.jpg",
    "Suippopyrstösirri":"a5ca4bf2-3d6e-4ea5-ab02-69508be838aa.jpg",
    "Pääskykahlaaja":"a659e7c7-453b-4356-bf3d-e7139e724342.jpg",
    "Pohjankiisla":"a68dd816-705a-4e53-8e2d-d3e7671a1a87.jpg",
    "Kirjosiipikäpylintu":"a82b5fa2-e29a-4ae3-920f-830bbe179507.jpg",
    "Etelänkiisla":"a8793191-2f84-4c14-8a00-cca629fe8249.jpg",
    "Pikkulokki":"a87f11ad-ded2-4a88-9daa-ae6845d87b3b.jpg",
    "Ruskopääsirkku":"a8c58ddf-09be-4a4e-a891-2e9bf75b9138.jpg",
    "Aavikkotulkku":"a8d1dc79-5134-4b07-83aa-44e27899cd17.jpg",
    "Nokikana":"a9c0d6f9-ef7a-4950-a517-53f7c15a5fae.jpg",
    "Heinätavi":"a9db95c3-602b-4777-b49d-df8f9615bb3d.jpg",
    "Ruokokerttunen":"a9e606f6-e378-424e-a766-51c733847762.jpg",
    "Punasotka":"a9f4954f-15ad-4cde-af28-41434e65d834.jpg",
    "Lapinuunilintu":"ab5869ed-3bba-4457-a6a0-032e92be42d3.jpg",
    "Etelänsatakieli":"ab68681f-6683-4fe4-b61a-893d380ca022.jpg",
    "Suohyyppä":"ac99b903-c346-4efe-9bdb-d1b3f679919d.jpg",
    "Urpiainen":"ad1ecfbe-8433-49db-95f7-e8cd4a267f10.jpg",
    "Peippo":"ad9926f6-f334-4415-a4f9-9e2657f37212.jpg",
    "Kangaskiuru":"b13318c9-98e0-4502-8591-e777179335bc.jpg",
    "Kiiruna":"b1697270-b08f-4522-ba64-9ee66f281117.jpg",
    "Lehtopöllö":"b1a023b5-d28e-4ff9-b3f2-ea6588ecbbb7.jpg",
    "Valkosiipitiira":"b1aee5cb-b774-4636-b829-b7f0682a5131.jpg",
    "Punarinta":"b1d718f7-2920-48df-b7e8-520d57214e9f.jpg",
    "Keltahemppo":"b2b228c0-cf1d-4faf-8088-d0323d349591.jpg",
    "Mustakurkkukerttu":"b38fefe3-f168-4ae7-ac29-dbd5bcad0399.jpg",
    "Ruskosuohaukka":"b3f5559c-f116-4277-9dd6-9fb0e44acf25.jpg",
    "Nummikirvinen":"b47e0e7c-ae1d-458d-af3b-d78f2467a168.jpg",
    "Västäräkki":"b5bb5409-0cd4-44aa-bd0b-2c512cd2da37.jpg",
    "Kaakkuri":"b6a70c64-9cb0-4b75-a534-c683a4d5c841.jpg",
    "Hömötiainen":"b733bbd2-bc3d-4e13-8b22-8b814544eb31.jpg",
    "Punatulkku":"b76381d6-f764-4386-acd1-201d57ef2e55.jpg",
    "Pikkukuovi":"b9df40bc-616b-47af-a355-c898e257aa11.jpg",
    "Vuoriuunilintu":"b9f9dbe2-7224-49a4-ad9e-e9a50894e250.jpg",
    "Taigakuovi":"ba56c47f-7d40-48a2-a86d-9cc82e418816.jpg",
    "Munkkikorppikotka":"baae6675-0968-4136-85e3-5f35a28cceed.jpg",
    "Mustaotsalepinkäinen":"bab8a3f7-018e-4108-99df-0e55c2c0fbe8.jpg",
    "Tundraurpiainen":"bad1103e-d71c-41cd-8c5f-799134dcd4e2.jpg",
    "Rytikerttunen":"bb49befc-ff07-43a5-8f85-64ae999d2e71.jpg",
    "Mustakurkku-uikku":"bb51eef3-8121-408b-83a9-50793c471fac.jpg",
    "Morsiosorsa":"bb5582cb-1a15-4b97-a4ea-24f0961e7f29.jpg",
    "Karimetso":"bcf67697-efc1-4d6b-8564-3e1ed4b269d9.jpg",
    "Palsasirri":"bd8db265-09fb-4dae-bd76-9dba0ff67da0.jpg",
    "Viirupöllö":"bda95713-2a09-4df7-9938-36bf6f116962.jpg",
    "Tervapääsky":"bec9a845-8fed-4d32-9ff4-1a80687434fc.jpg",
    "Harmaakurkkurastas":"bf9ea9a6-91f2-426f-9863-7d45601123ae.jpg",
    "Kapustarinta":"bfb0516d-8803-4734-b66b-99dd98b15627.jpg",
    "Räyskä":"bfe66236-683b-45bd-a26a-f5367d6fbba2.jpg",
    "Välimerenlokki":"c04fb56d-9076-4f12-946d-d92117ded7ea.jpg",
    "Pussitiainen":"c1efa867-3e30-4fac-9509-3416c638347f.jpg",
    "Uivelo":"c203a512-d71e-41ca-9400-1a228ab7c66c.jpg",
    "Sepelkyyhky":"c5807f32-03c0-4999-a85b-cfbcd8463c8c.jpg",
    "Niittysuohaukka":"c733bda3-8b97-43b1-8662-288b79e1f46e.jpg",
    "Pikkukäpylintu":"c79bd6c7-4a8f-45c4-ae03-6640c57ccb23.jpg",
    "Harjakoskelo":"c94acebc-0312-40ad-abaa-0c77f58ecf5f.jpg",
    "Punapäälepinkäinen":"c9ac86a1-863f-47e1-aaf6-25accfb7b24c.jpg",
    "Lyhytvarvaskiuru":"c9fff658-c8fa-49d5-a803-65353c43a718.jpg",
    "Maakotka":"cab14b86-1903-480a-a095-aaae475cfad1.jpg",
    "Kalliokiipijä":"cae9fff0-1210-4cad-9e22-d0dbcccbdf56.jpg",
    "Isolokki":"cb7cb128-52a7-40bf-b0b0-af03fcedafae.jpg",
    "Liejukana":"cbbe8007-ee92-4157-82aa-23d801d4f734.jpg",
    "Aavikkojuoksija":"cbc0e8ff-2811-4db4-adbe-8a6ca5f164f0.jpg",
    "Amerikanjääkuikka":"cc5fc4a2-1516-4b9d-9e57-0e7da28c43bf.jpg",
    "Rääkkähaikara":"cdcc9fa8-06f1-41c3-ab72-fcf20a94e906.jpg",
    "Isotrappi":"cf0b1c21-df35-47ba-a111-4945d5287a2f.jpg",
    "Haapana":"cf6a8a28-2f84-41d9-8995-1d0f982ff810.jpg",
    "Kirjosieppo":"d22e2b1d-7039-4071-b4ca-1f6cbaa13045.jpg",
    "Lapinpöllö":"d30a5c29-7eec-4ada-b7a3-dc9f7886d23a.jpg",
    "Alppirautiainen":"d330a712-1658-47be-acc0-cd0c9f40f423.jpg",
    "Pikku-uikku":"d3901490-7ba8-4cdc-9be9-161d71c7f522.jpg",
    "Hernekerttu":"d40adc44-2e7e-4898-91d1-b4014cb2bdc4.jpg",
    "Pikkutrappi":"d4277f66-6329-477e-9167-2ea01457b9f2.jpg",
    "Pikkukiljukotka":"d56d2f2a-2056-46c6-8beb-566ba8145189.jpg",
    "Mustavaris":"d80c5b5e-a0bb-440f-a24a-9f42da4f8369.jpg",
    "Kattohaikara":"d9112dcb-ac75-48d7-8df4-14b3bb056e3a.jpg",
    "Kiuru":"da32f4a2-616a-4bc2-91c9-cc05f75baae8.jpg",
    "Pikkuhaikara":"dac75af4-a1aa-4a66-a302-f15b78831bff.jpg",
    "Jänkäsirriäinen":"dad39895-119e-4915-93c9-cdccb6ad0927.jpg",
    "Aroharmaalokki":"dbab36b2-dc72-43cf-be05-862ac5028e6e.jpg",
    "Pelikaani":"dc2a424b-ed49-4ccd-bdc1-9a3cbfd44254.jpg",
    "Kivikkosirkku":"dc54ed4d-34f2-4774-ba32-a3fc8fedeb3b.jpg",
    "Tundravikla":"dca851df-3d6d-4da0-9cbc-765bb28c3fce.jpg",
    "Mustapäätasku":"dcdc58aa-2756-45e9-8843-8f87cb732cfa.jpg",
    "Ruosterastas":"dd8cc7c2-da86-4d4c-95a8-3bd768081904.jpg",
    "Merimetso":"def0b3a8-89aa-4fd6-9d19-75cec33631d7.jpg",
    "Kashmirinuunilintu":"dfc26a6d-edd2-4b57-a437-ab8b50de7bd0.jpg",
    "Kyhmypilkkasiipi":"e07df931-e98f-4586-b698-ed28c5d746a9.jpg",
    "Sepelrastas":"e0a721bf-ebd5-4d12-85ad-71ccc5e4f750.jpg",
    "Nokisorsa":"e257eedd-54c3-44cf-abdc-87daa284fb3a.jpg",
    "Kuusitiainen":"e429e5ee-0655-4290-a511-c76f27192afb.jpg",
    "Mustakaulauikku":"e50c4730-1a82-4fc5-9567-44ab16947808.jpg",
    "Ruostepääsky":"e56eca14-df6f-401f-b11a-12a5e30d6d00.jpg",
    "Törmäpääsky":"e6a475cf-f6b3-4ccc-ba62-0fb35801fc27.jpg",
    "Naakka":"e7968a12-0c99-48b9-9af0-020fc7497d06.jpg",
    "Vihervarpunen":"e7a7b69d-3391-4a63-856d-75959e832bea.jpg",
    "Pähkinänakkeli":"e84a8eb7-6642-4c7c-9c58-da2c9ea3facb.jpg",
    "Jouhisorsa":"ea4f53ca-b4b3-4c72-a4b6-0fd7b2f33963.jpg",
    "Etelänharmaalokki":"eaaf637a-4e12-4a87-a192-17cc68dc8963.jpg",
    "Vesipääsky":"ecf2fee2-dc96-4a62-8aa5-682b476b932b.jpg",
    "Taivaanvuohi":"ed09dc5a-68c2-4a5e-bd74-2cb4555da86c.jpg",
    "Siperiankurmitsa":"ed14b6c6-9e37-4b42-a718-feb5857a21f4.jpg",
    "Valkoposkitiira":"ee0d9a9c-7cca-4678-a8bb-5abc0ca5ad7b.jpg",
    "Pikkulepinkäinen":"ee656434-03dd-4881-b2a8-b7eef36d029d.jpg",
    "Kuningaskalastaja":"ee73ccc4-d559-4303-9e50-13edd0a3e310.jpg",
    "Punakaulahanhi":"ee740a92-a000-4798-9c76-d2b0ff37bcd8.jpg",
    "Paksujalka":"ee9fa417-981d-40ef-b9bb-dcd74af88a29.jpg",
    "Sinisuohaukka":"eebb1488-dce8-4a94-a532-0b57dded2718.jpg",
    "Tukkasotka":"ef7227a5-06e0-4b60-a4f8-7795c3e830bd.jpg",
    "Pitkäkoipisirri":"f064914a-d297-4754-a520-7cd5dd6d790a.jpg",
    "Ruokosirkkalintu":"f074ed13-4eac-403e-a442-e39942f9739c.jpg",
    "Käki":"f160917c-458c-40ce-b843-831d0c8f0d42.jpg",
    "Satakieli":"f1bd2632-69cd-419c-a228-b704a30b1f41.jpg",
    "Pikkutelkkä":"f31159b8-6921-46a4-b778-831f64b52ac5.jpg",
    "Hippiäinen":"f3414b96-040b-45e6-b907-e49439fbd688.jpg",
    "Tylli":"f4098063-1b44-48d1-9182-8c5e7b72c358.jpg",
    "Luhtakerttunen":"f456b848-d6cf-4ab3-b727-eb4daaeec4c4.jpg",
    "Lehtokerttu":"f47b19e6-844a-4539-836a-e907a441dcb1.jpg",
    "Arokotka":"f5895d28-42c4-4d1a-9dbc-37a60096f0e6.jpg",
    "Tunturipöllö":"f80f414f-092e-44e7-a5cc-4dc43f20d433.jpg",
    "Kuningasmerikotka":"f818622c-4988-4092-a8f5-058063d19b6c.jpg",
    "Härkälintu":"f8d90c5a-9794-4439-a909-e62fc4618b50.jpg",
    "Valkopäätiainen":"f965334c-f1e9-4e4a-b1c1-3e3f008c719b.jpg",
    "Sepelhanhi":"f96812d2-84b5-4974-9c4d-effd13f29640.jpg",
    "Intianriisihaikara":"fb0009f9-0bf2-4f0c-b0b8-b7ecf4ef31c8.jpg",
    "Närhi":"fb4f84f3-3133-499a-bf97-5f07d019c114.jpg",
    "Pikkujoutsen":"fb90e0ea-3faa-4e02-aba1-797cf22940a4.jpg",
    "Harakkakäki":"fcb5730b-6d38-4d17-b93e-6c8f16a2a0b9.jpg",
    "Kettusirkku":"fd0a5e9a-184a-493d-b1ca-1cf5b0038169.jpg",
    "Merikotka":"fd40051c-04ad-4e3e-ac42-485adb09b864.jpg",
}
