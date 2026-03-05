import EmblaCarousel from "../../../../components/shared/EmblaCarousel";
import { Rate } from "antd";
import { Review } from "@/types/review";

const formatDate = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const ReviewsCarousel = ({ reviews }: { reviews: Review[] }) => {
  return (
    <div className="py-3">
      <EmblaCarousel arrowButtons autoplay>
        {reviews.map((review: Review, index: number) => (
          <div
            key={index}
            className="flex-[0_0_100%] min-[450px]:flex-[0_0_80%] sm:flex-[0_0_65%] md:flex-[0_0_55%] lg:flex-[0_0_40%] pl-3"
          >
            <div className="rounded-xl border border-black/20 bg-white p-4 shadow">
              <div className="mb-2">
                <h3 className="text-md font-semibold text-gray-900">
                  {review.userName || "Customer"}
                </h3>
                <p className="text-xs text-gray-500">
                  {formatDate(review.createdAt)}
                </p>
              </div>
              <div className="mb-2">
                <Rate
                  disabled
                  defaultValue={review.rating}
                  allowHalf
                  style={{ fontSize: 14, color: "#F59E0B" }}
                />
              </div>
              <p className="text-sm text-gray-700 leading-relaxed line-clamp-3">
                {review.comment}
              </p>
            </div>
          </div>
        ))}
      </EmblaCarousel>
    </div>
  );
};

export default ReviewsCarousel;
