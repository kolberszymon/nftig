import axios from "axios";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSdkContext } from "../contexts/SDKContext";
import { PrepareMintRequest } from "@rarible/sdk/build/types/nft/mint/prepare-mint-request.type";
import { toContractAddress } from "@rarible/types";
import { create } from "ipfs-http-client";


// FILL IT WITH YOUR TOKEN AND USER_ID
const LONG_LIVED_TOKEN =;
const USER_ID = ;
const POST_PORTION = 3;
const FETCH_IDS_URL = `https://graph.instagram.com/v13.0/${USER_ID}/media?access_token=${LONG_LIVED_TOKEN}&fields=id`;

const create_media_details_url = (media_id) => {
  const MEDIA_DETAILS_URL = `https://graph.instagram.com/v13.0/${media_id}?access_token=${LONG_LIVED_TOKEN}&fields=media_url,media_type,caption`;
  return MEDIA_DETAILS_URL;
};

type MediaDetails = {
  media_url: string;
  media_type: string;
  id: string;
  caption: string;
};

const infura = {
  host: "ipfs.infura.io",
  port: 5001,
  protocol: "https",
  timeout: 15000,
};

const ipfs = create(infura);

export default function Home() {
  const { sdk, wallet } = useSdkContext();

  const [mediaIds, setMediaIds] = useState<Array<string>>([]);
  const [mediaDetails, setMediaDetails] = useState<Array<MediaDetails>>([]);
  const [fetchedPostPortion, setFetchedPostPortion] = useState<number>(1);

  useEffect(() => {
    fetchAllInstagramPostsIds();
  }, []);

  useEffect(() => {
    if (mediaIds.length > 0) {
      fetchPostPortion();
    }
  }, [mediaIds]);

  useEffect(() => {
    console.log(mediaDetails);
  }, [mediaDetails]);

  const fetchAllInstagramPostsIds = async () => {
    let { data: response } = await axios.get(FETCH_IDS_URL);

    let idArray = [];

    for (let i = 0; i < response.data.length; i++) {
      idArray.push(response.data[i].id);
    }

    // Filtering array out of undefined
    idArray = idArray.filter((x) => x !== undefined);
    console.log(idArray);
    // We're setting all of our posts ids, because it's cheap
    setMediaIds(idArray);
  };

  const fetchPostPortion = async () => {
    let fetchedMediaDetails = [];
    for (
      let i = (fetchedPostPortion - 1) * POST_PORTION;
      i < fetchedPostPortion * POST_PORTION;
      i++
    ) {
      let response = await axios.get(create_media_details_url(mediaIds[i]));
      console.log(response);
      fetchedMediaDetails.push(response.data);
    }

    setMediaDetails((mediaDetails) => [
      ...mediaDetails,
      ...fetchedMediaDetails,
    ]);

    setFetchedPostPortion(fetchedPostPortion + 1);
  };

  const createIpfsURI = async (mediaDetail: MediaDetails) => {
    let jsonObject = {
      description: mediaDetail.caption,
      name: "You",
      image: mediaDetail.media_url,
      attributes: [],
      external_url: "",
    };

    const { path } = await ipfs.add(JSON.stringify(jsonObject));

    return "ipfs:/" + path;
  };

  const createNFT = async (mediaDetailIndex: number) => {
    const uri = await createIpfsURI(mediaDetails[mediaDetailIndex]);

    const raribleRinkebyCollection =
      "ETHEREUM:0x6ede7f3c26975aad32a475e1021d8f6f39c89d82";

    const mintRequest: PrepareMintRequest = {
      collectionId: toContractAddress(raribleRinkebyCollection),
    };

    const mintResponse = await sdk.nft.mint(mintRequest);

    const response = await mintResponse.submit({
      uri,
      supply: 1,
      lazyMint: true,
    });

    console.log(response);
  };

  return (
    <div className="relative flex p-4 mx-auto h-screen w-full ">
      <div className="absolute top-8 left-8 flex flex-col">
        {LONG_LIVED_TOKEN
          ? "Instagram Connected ⭐️"
          : "You have to provide your long lived token in code"}
      </div>
      <main className="w-full h-full bg-white flex justify-center items-center py-4">
        <div className=" overflow-y-scroll overscroll-hidden h-full justify-start items-center flex flex-col pt-4 gap-4">
          {mediaDetails.map((mediaDetail, index) => {
            return (
              <div className="w-1/2 relative" key={index}>
                <img src={mediaDetail.media_url} className="w-full h-auto" />
                <button
                  className="absolute top-3 left-3 bg-white px-2 py-2 rounded-lg shadow-md border-2 border-gray-200 text-purple-600"
                  onClick={() => createNFT(index)}
                >
                  Create NFT
                </button>
              </div>
            );
          })}
        </div>
      </main>

      <button
        className="absolute left-8 bottom-8 bg-white p-2 rounded-lg shadow-md border-red-200 border-2"
        onClick={() => fetchPostPortion()}
      >
        Load more images
      </button>
    </div>
  );
}
