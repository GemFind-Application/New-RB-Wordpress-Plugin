import React, { useEffect, useState } from "react";
import Select from "react-select";
import { LoadingOverlay, Loader } from "react-overlay-loader";

const Certificates = (props) => {
    const [selectedCertificates, setSelectedCertificates] = useState([]);
    const [loaded, setLoaded] = useState(false);

    const handleChange = (selectedOptions) => {
        setLoaded(true);

        const CerificateData = selectedOptions
            .map(function (m) {
                return m.value;
            })
            .join(",");

        setSelectedCertificates(selectedOptions);
        props.onChangeOrderType(CerificateData);

        setTimeout(() => {
            setLoaded(false);
        }, 1000);
    };

    useEffect(() => {}, [selectedCertificates]);

    return (
        <div className="range-slider_diamond">
            <LoadingOverlay className="_loading_overlay_wrapper">
                <Loader fullPage loading={loaded} />{" "}
            </LoadingOverlay>
            <div className="slider">
                <h4 className="f_heading diamond_heading"> CERTIFICATES</h4>
                <div className="diamond-ui-slider diamond-small-slider">
                    <Select
                        options={props.certificateData.map((item) => ({
                            label: item.certificateName, // Use 'certificateName' or appropriate property here
                            value: item.certificateName, // Use 'certificateName' or appropriate property here
                        }))}
                        onChange={handleChange}
                        value={selectedCertificates}
                        isMulti
                    />
                </div>
            </div>
        </div>
    );
};

export default Certificates;
