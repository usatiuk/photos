import "./Overview.scss";
import * as React from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { IAppState } from "~redux/reducers";
import { photosLoadStart } from "~redux/photos/actions";
import { IPhotoReqJSON } from "~../../src/entity/Photo";
import { LoadingStub } from "~LoadingStub";
import { PhotoCard } from "./PhotoCard";
import {
    Button,
    Classes,
    H1,
    H2,
    H3,
    Overlay,
    Spinner,
} from "@blueprintjs/core";
import { UploadButton } from "./UploadButton";
import { Photo } from "./Photo";
import { getPhotoThumbPath } from "~redux/api/photos";

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

    const dates = props.photos.reduce(
        (
            acc: Record<
                string,
                Record<string, Record<string, IPhotoReqJSON[]>>
            >,
            photo,
        ) => {
            const date = new Date(photo.shotAt);
            const year = date.toLocaleString("default", { year: "numeric" });
            const month = date.toLocaleString("default", { month: "long" });
            const day = date.toLocaleString("default", { day: "numeric" });

            acc[year] = acc[year] || {};
            acc[year][month] = acc[year][month] || {};
            acc[year][month][day] = acc[year][month][day] || [];
            acc[year][month][day].push(photo);

            return acc;
        },
        {},
    );

    const photos = Object.keys(dates).reduce(
        (acc: JSX.Element[], year): JSX.Element[] => {
            const els = Object.keys(dates[year]).reduce(
                (accMonths: JSX.Element[], month): JSX.Element[] => {
                    const photos = Object.values(dates[year][month]).reduce(
                        (accDays: IPhotoReqJSON[], day) => {
                            return [...day, ...accDays];
                        },
                        [],
                    );
                    const photosEls = photos.map((photo) => {
                        return (
                            <PhotoCard
                                key={photo.id}
                                photo={photo}
                                onClick={() => onCardClick(photo.id)}
                            />
                        );
                    });
                    return [
                        ...accMonths,
                        <div className="month" key={`${year}${month}`}>
                            <H3>{month}</H3>
                            <div className="list">
                                {photosEls}
                                <div className="photoStub" />
                            </div>
                        </div>,
                    ];
                },
                [],
            );
            return [
                <div className="year" key={year}>
                    <H2>{year}</H2>
                </div>,
                ...els,
                ...acc,
            ];
        },
        [],
    );

    function onLoaderScroll(e: React.UIEvent<HTMLElement>) {
        if (
            e.currentTarget.scrollTop + e.currentTarget.clientHeight >=
            e.currentTarget.scrollHeight - 100
        ) {
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
                transitionDuration={300}
                lazy
            >
                <div id="photoOverlayContainer">
                    <div id="photo">
                        <Photo id={selectedPhoto} />
                    </div>
                    <div id="photoOverlayDrawer">
                        <Button
                            icon="cross"
                            onClick={() => {
                                setOverlayOpen(false);
                            }}
                        />
                    </div>
                </div>
            </Overlay>
            <div id="overviewContainer" onScroll={onLoaderScroll}>
                <div id="overview">
                    <div id="actionbar">
                        <UploadButton />
                    </div>
                    {photos}
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
