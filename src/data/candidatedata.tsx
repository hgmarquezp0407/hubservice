import SpkSearchcandidate from "@/app/components/@spk-reusable/reusable-pages/spk-searchcandidate";

interface Swiper {
    id: number,
    name: string,
    jobTitle: string,
    location: string,
    image: string,
    ratingCount: string,
    annualPay: string,
    languages: string,
    badge: string,
    badge1: string,
    wishlist: boolean,
    avatarColor: string,
    avatarColor1: string,
    ratings: object;
}
const Swiperdata: Swiper[] = [
    {
        id: 1,
        name: "Samantha",
        jobTitle: "UX Designer",
        location: "Canada",
        image: "../../../assets/images/faces/1.jpg",
        ratingCount: '(24)',
        annualPay: "$55k - $80k",
        languages: "French, English",
        badge: 'Masters Degree',
        badge1: "Master's Degree",
        wishlist: false,
        avatarColor: 'info',
        avatarColor1: "danger",
        ratings: (
            <>

                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-half"></i></span>
            </>
        ),
    },
    {
        id: 2,
        name: "Michael",
        jobTitle: "UX Designer",
        location: "New York",
        image: "../../../assets/images/faces/11.jpg",
        ratingCount: '(18)',
        annualPay: "$65k - $90k",
        languages: "French, English",
        badge: "(Bachelors's) Degree",
        badge1: "Bachelor's Degree",
        wishlist: false,
        avatarColor: 'danger',
        avatarColor1: "info",
        ratings: (
            <>

                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-half"></i></span>
            </>
        ),
    },
    {
        id: 3,
        name: "Emily",
        jobTitle: "React Developer",
        location: "London, UK",
        image: "../../../assets/images/faces/3.jpg",
        ratingCount: '(20)',
        annualPay: "$50k - $70k",
        languages: "French, English",
        badge: "(Masters's) Degree",
        badge1: "Master's Degree",
        wishlist: false,
        avatarColor: 'info',
        avatarColor1: "danger",
        ratings: (
            <>

                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-half"></i></span>
            </>
        ),
    },
    {
        id: 4,
        name: "Joseph",
        jobTitle: "UI Developer",
        location: "New York",
        image: "../../../assets/images/faces/15.jpg",
        ratingCount: '(35)',
        annualPay: "$65k - $90k",
        languages: "English, French",
        badge: "(Bachelors's) Degree",
        badge1: "Bachelor's Degree",
        wishlist: false,
        avatarColor: 'info',
        avatarColor1: "danger",
        ratings: (
            <>

                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-fill"></i></span>
                <span className="text-warning"><i className="bi bi-star-half"></i></span>
            </>
        ),
    },
];

export const SwiperComponent = Swiperdata.map((candidate, index) => (
    <SpkSearchcandidate key={Math.random()} cardClass="shadow-none border" object={candidate}
    />
))

export default SwiperComponent;
