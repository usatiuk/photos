import "./Overview.scss";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IAppState } from "~redux/reducers";
import { photosLoadStart } from "~redux/photos/actions";
import { IPhotoReqJSON } from "~../../src/entity/Photo";
import { LoadingStub } from "~LoadingStub";
import { PhotoCard } from "./PhotoCard";
import { Button, Classes, Overlay, Spinner } from "@blueprintjs/core";
import { UploadButton } from "./UploadButton";
import { Photo } from "./Photo";

export interface IOverviewComponentProps {
    photos: IPhotoReqJSON[];
    triedLoading: boolean;
    allPhotosLoaded: boolean;
    overviewFetching: boolean;
    overviewFetchingError: string | null;
    overviewFetchingSpinner: boolean;

    fetchPhotos: () => void;
}

export const OverviewComponent: React.FunctionComponent<IOverviewComponentProps> = (
    props,
) => {
    const [selectedPhoto, setSelectedPhoto] = React.useState<number>(0);
    const [isOverlayOpened, setOverlayOpen] = React.useState<boolean>(false);

    const onCardClick = (id: number) => {
        setSelectedPhoto(id);
        setOverlayOpen(true);
    };

    if (
        props.photos.length === 0 &&
        !props.triedLoading &&
        !props.overviewFetching
    ) {
        props.fetchPhotos();
    }

    const photos = props.photos.map((photo) => (
        <PhotoCard
            key={photo.id}
            photo={photo}
            onClick={() => onCardClick(photo.id)}
        />
    ));

    function onLoaderScroll(e: React.UIEvent<HTMLElement>) {
        if (
            e.currentTarget.scrollTop + e.currentTarget.clientHeight >=
            e.currentTarget.scrollHeight
        ) {
            console.log(props.allPhotosLoaded, props.overviewFetching);
            if (!props.allPhotosLoaded && !props.overviewFetching) {
                props.fetchPhotos();
            }
        }
    }

    return (
        <>
            <Overlay
                autoFocus
                enforceFocus
                usePortal
                isOpen={isOverlayOpened}
                onClose={() => {
                    setOverlayOpen(false);
                }}
                lazy
            >
                <div id="photoOverlayContainer">
                    <Photo id={selectedPhoto} />
                </div>
            </Overlay>
            <div id="overviewContainer" onScroll={onLoaderScroll}>
                <div id="overview">
                    <div id="actionbar">
                        <UploadButton />
                    </div>
                    <div className="list">{photos}</div>
                    <div className="photosLoader">
                        {props.overviewFetching && <Spinner />}
                    </div>
                </div>
            </div>
        </>
    );
};

function mapStateToProps(state: IAppState) {
    return {
        photos: state.photos.photos,
        allPhotosLoaded: state.photos.allPhotosLoaded,
        overviewFetching: state.photos.overviewFetching,
        overviewFetchingError: state.photos.overviewFetchingError,
        overviewFetchingSpinner: state.photos.overviewFetchingSpinner,
        triedLoading: state.photos.triedLoading,
    };
}

function mapDispatchToProps(dispatch: Dispatch) {
    return { fetchPhotos: () => dispatch(photosLoadStart()) };
}

export const Overview = connect(
    mapStateToProps,
    mapDispatchToProps,
)(OverviewComponent);
