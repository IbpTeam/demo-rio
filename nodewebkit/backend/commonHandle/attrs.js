var attrPermission = {
  NOPERMISSION:0,//不可读不可写
  READ:1,        //可以读
  WRITE:2        //可读可写
};

var contactAttrPermissionList = {
  URI           :attrPermission.READ, 
  photoPath     :attrPermission.WRITE, 
  id            :attrPermission.NOPERMISSION, 
  name          :attrPermission.WRITE, 
  phone         :attrPermission.WRITE, 
  phone2        :attrPermission.WRITE, 
  phone3        :attrPermission.WRITE, 
  phone4        :attrPermission.WRITE, 
  phone5        :attrPermission.WRITE, 
  sex           :attrPermission.WRITE, 
  age           :attrPermission.WRITE, 
  email         :attrPermission.WRITE, 
  email2        :attrPermission.WRITE,
  createTime    :attrPermission.READ,
  createDev     :attrPermission.READ, 
  lastAccessTime:attrPermission.READ,
  lastAccessDev :attrPermission.READ,
  lastModifyTime:attrPermission.READ,
  lastModifyDev :attrPermission.READ,
  others        :attrPermission.WRITE 
};

var documentAttrPermissionList = {
  URI            :attrPermission.READ, 
  postfix        :attrPermission.WRITE, 
  filename       :attrPermission.WRITE, 
  id             :attrPermission.NOPERMISSION, 
  size           :attrPermission.READ, 
  path           :attrPermission.READ, 
  project        :attrPermission.WRITE, 
  createTime     :attrPermission.READ,
  createDev      :attrPermission.READ, 
  lastAccessTime :attrPermission.READ,
  lastAccessDev  :attrPermission.READ,
  lastModifyTime :attrPermission.READ,
  lastModifyDev  :attrPermission.READ,
  others         :attrPermission.WRITE
};

var musicAttrPermissionList = {
  URI           :attrPermission.READ, 
  postfix       :attrPermission.WRITE, 
  filename      :attrPermission.WRITE, 
  id            :attrPermission.NOPERMISSION, 
  size          :attrPermission.READ, 
  path          :attrPermission.READ,
  format        :attrPermission.READ,
  bit_rate      :attrPermission.READ,
  frequency     :attrPermission.READ,
  TIT2          :attrPermission.READ,
  TPE1          :attrPermission.READ,
  TALB          :attrPermission.READ,
  TDRC          :attrPermission.READ,
  APIC          :attrPermission.READ,
  track         :attrPermission.READ,
  TXXX          :attrPermission.READ,
  COMM          :attrPermission.READ,
  createTime    :attrPermission.READ,
  createDev     :attrPermission.READ, 
  lastAccessTime:attrPermission.READ,
  lastAccessDev :attrPermission.READ,
  lastModifyTime:attrPermission.READ,
  lastModifyDev :attrPermission.READ,
  others        :attrPermission.WRITE
};

var pictureAttrPermissionList = {
  URI           :attrPermission.READ, 
  postfix       :attrPermission.WRITE, 
  filename      :attrPermission.WRITE, 
  id            :attrPermission.NOPERMISSION, 
  size          :attrPermission.READ, 
  path          :attrPermission.READ, 
  location      :attrPermission.WRITE, 
  createTime    :attrPermission.READ,
  createDev     :attrPermission.READ, 
  lastAccessTime:attrPermission.READ,
  lastAccessDev :attrPermission.READ,
  lastModifyTime:attrPermission.READ,
  lastModifyDev :attrPermission.READ,
  others        :attrPermission.WRITE
};

var videoAttrPermissionList = {
  URI                 :attrPermission.READ, 
  postfix             :attrPermission.WRITE, 
  filename            :attrPermission.WRITE, 
  id                  :attrPermission.NOPERMISSION, 
  size                :attrPermission.READ, 
  path                :attrPermission.READ, 
  directorName        :attrPermission.READ, 
  actorName           :attrPermission.READ, 
  createTime          :attrPermission.READ,
  createDev           :attrPermission.READ, 
  lastAccessTime      :attrPermission.READ,
  lastAccessDev       :attrPermission.READ,
  lastModifyTime      :attrPermission.READ,
  lastModifyDev       :attrPermission.READ,
  others              :attrPermission.WRITE,
  format_long_name    :attrPermission.READ,
  width               :attrPermission.READ,
  height              :attrPermission.READ,
  display_aspect_ratio:attrPermission.READ,
  pix_fmt             :attrPermission.READ,
  duration            :attrPermission.READ,
  major_brand         :attrPermission.READ,
  minor_version       :attrPermission.READ,
  compatible_brands   :attrPermission.READ
};

function getReadableAttrs(category){
  
}
exports.getReadableAttrs = getReadableAttrs;