"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeoJson2Shaper = void 0;
var jszip_1 = __importDefault(require("jszip"));
/**
 * GeoJson2Shaper 类提供将 GeoJSON 转换为 Shapefile 的功能
 * 由于 Shapefile 只能包含相同类型的几何记录，transform 方法会为每种不同的几何类型生成独立的 Shapefile 集（shp, shx, dbf, cpg, prj, csv）
 */
var GeoJson2Shaper = /** @class */ (function () {
    function GeoJson2Shaper() {
        this.files = {};
    }
    /**
     * 将 GeoJSON 转换为 Shapefile 并返回 Promise<Blob>
     *
     * @param jsonObject - 输入的 GeoJSON 对象
     * @param resultZipFile - 输出 zip 文件的名称（可选）
     * @returns Promise<Blob> - 包含 Shapefile 的 zip 文件的 Blob
     */
    GeoJson2Shaper.transformAndDownload = function (jsonObject, resultZipFile) {
        return __awaiter(this, void 0, void 0, function () {
            var geoJson2Shaper, zip, fname, f;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        geoJson2Shaper = new GeoJson2Shaper();
                        // 初始化文件生成器
                        geoJson2Shaper.files["Point"] = new PointFileGen();
                        geoJson2Shaper.files["LineString"] = new LineStringFileGen();
                        geoJson2Shaper.files["Polygon"] = new PolygonFileGen();
                        geoJson2Shaper.files["MultiPoint"] = new MultiPointFileGen();
                        geoJson2Shaper.files["MultiLineString"] = new MultiLineStringFileGen();
                        geoJson2Shaper.files["MultiPolygon"] = new MultiPolygonFileGen();
                        // 处理每个要素
                        jsonObject.features.forEach(function (item) {
                            if (item.geometry) {
                                geoJson2Shaper.files[item.geometry.type].process(item);
                            }
                        });
                        zip = new jszip_1.default();
                        for (fname in geoJson2Shaper.files) {
                            f = geoJson2Shaper.files[fname];
                            if (f.records.length > 0) {
                                f.writeShp();
                                zip.file(f.getShpName(), f.shp);
                                f.writeShx();
                                zip.file(f.getShxName(), f.shx);
                                f.writeDbf();
                                zip.file(f.getDbfName(), f.dbf);
                                zip.file(f.getCpgName(), "UTF-8");
                                if (f.useCSV) {
                                    f.writeCsv();
                                    zip.file(f.getCsvName(), f.csv);
                                }
                                if (jsonObject.crs &&
                                    jsonObject.crs.properties &&
                                    jsonObject.crs.properties.name) {
                                    zip.file(f.getPrjName(), jsonObject.crs.properties.name);
                                }
                            }
                        }
                        return [4 /*yield*/, zip.generateAsync({ type: "blob" })];
                    case 1: 
                    // 生成 zip 文件并返回 Blob
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 下载 Blob 数据（可选使用）
     * @param blob - 要下载的 Blob 数据
     * @param resultZipFile - 输出文件名
     */
    GeoJson2Shaper.downloadBlob = function (blob, resultZipFile) {
        if (typeof window !== "undefined") {
            if (window.navigator && window.navigator.msSaveBlob) {
                window.navigator.msSaveBlob(blob, resultZipFile);
            }
            else {
                var a = document.createElement("a");
                a.style.display = "none";
                document.body.appendChild(a);
                var url = window.URL.createObjectURL(blob);
                a.href = url;
                a.download = resultZipFile;
                a.target = "_self";
                a.click();
                window.URL.revokeObjectURL(url);
            }
        }
    };
    /**
     * Shape record writers - bounding box
     */
    GeoJson2Shaper.writeBoundingBox = function (rec, shpView, offset) {
        var ofs = 8 + offset;
        shpView.setFloat64(4 + ofs, rec.X1, true);
        shpView.setFloat64(12 + ofs, rec.Y1, true);
        shpView.setFloat64(20 + ofs, rec.X2, true);
        shpView.setFloat64(28 + ofs, rec.Y2, true);
    };
    /**
     * Shape record writers - record length calculators
     */
    GeoJson2Shaper.getPointContentLength = function (rec) {
        return 20;
    };
    GeoJson2Shaper.getMultiPointContentLength = function (rec) {
        return 40 + 8 * rec.points.length;
    };
    GeoJson2Shaper.getPolygonContentLength = function (rec) {
        return 44 + 4 * rec.partCount + 8 * rec.points.length;
    };
    /**
     * Shape record writers - geometry writers
     */
    GeoJson2Shaper.writePointGeometry = function (rec, shpView, offset, id) {
        if (rec.points.length === 0)
            return;
        // record header
        shpView.setInt32(0 + offset, id, false); //big record id
        shpView.setInt32(4 + offset, GeoJson2Shaper.getPointContentLength(rec) / 2, false); //big record len
        //record content
        var ofs = 8 + offset;
        shpView.setInt32(0 + ofs, rec.fileGen.shape, true);
        shpView.setFloat64(4 + ofs, rec.points[0], true);
        shpView.setFloat64(12 + ofs, rec.points[1], true);
    };
    GeoJson2Shaper.writePolygonGeometry = function (rec, shpView, offset, id) {
        var pc = rec.points.length;
        if (pc === 0)
            return;
        // record header
        shpView.setInt32(0 + offset, id, false); //big record id
        shpView.setInt32(4 + offset, GeoJson2Shaper.getPolygonContentLength(rec) / 2, false); //big record len
        //record content
        var ofs = 8 + offset;
        shpView.setInt32(0 + ofs, rec.fileGen.shape, true);
        GeoJson2Shaper.writeBoundingBox(rec, shpView, offset);
        shpView.setInt32(36 + ofs, rec.partCount, true);
        shpView.setInt32(40 + ofs, pc / 2, true);
        ofs = 8 + 44 + offset;
        for (var i = 0; i < rec.partCount; i++)
            shpView.setInt32(ofs + 4 * i, rec.partIndices[i], true);
        ofs = 8 + 44 + offset + 4 * rec.partCount;
        for (var i = 0; i < pc; i++)
            shpView.setFloat64(ofs + 8 * i, rec.points[i], true);
    };
    GeoJson2Shaper.writeMultiPointGeometry = function (rec, shpView, offset, id) {
        var pc = rec.points.length;
        if (pc === 0)
            return;
        // record header
        shpView.setInt32(0 + offset, id, false); //big record id
        shpView.setInt32(4 + offset, GeoJson2Shaper.getMultiPointContentLength(rec) / 2, false); //big record len
        //record content
        var ofs = 8 + offset;
        shpView.setInt32(0 + ofs, rec.fileGen.shape, true);
        GeoJson2Shaper.writeBoundingBox(rec, shpView, offset);
        shpView.setInt32(36 + ofs, pc / 2, true);
        ofs = 8 + 40 + offset;
        for (var i = 0; i < pc; i++)
            shpView.setFloat64(ofs + 8 * i, rec.points[i], true);
    };
    return GeoJson2Shaper;
}());
exports.GeoJson2Shaper = GeoJson2Shaper;
/**
 * Shapefile record class
 * 收集单个 shape 记录的所有信息 - 源几何、文件生成器对象、边界框、属性
 */
var ShapeRecordImpl = /** @class */ (function () {
    function ShapeRecordImpl(fileGen, item) {
        this.points = [];
        this.partIndices = [];
        this.partCount = 0;
        this.X1 = 9999;
        this.X2 = -9999;
        this.Y1 = -9999;
        this.Y2 = 9999;
        this.properties = {};
        this.propertiesOrig = {};
        this.fileGen = fileGen;
        fileGen.useCSV = false;
        fileGen.records.push(this);
        if (item.properties) {
            for (var pname in item.properties) {
                fileGen.propertyNames[pname] = pname;
                var orig = item.properties[pname];
                var val = ShapeRecordImpl.toUTF8Array(orig);
                var len = val ? val.length : 0;
                if (len > 250) {
                    fileGen.useCSV = true;
                    len = 250;
                    if (val) {
                        val.splice(250);
                    }
                }
                this.properties[pname] = val || [];
                this.propertiesOrig[pname] = orig;
                if (!fileGen.propertyLengths[pname] ||
                    fileGen.propertyLengths[pname] < len)
                    fileGen.propertyLengths[pname] = len;
            }
        }
    }
    /**
     * 更新记录几何边界
     */
    ShapeRecordImpl.prototype.checkBounds = function (X, Y) {
        if (this.X1 > X)
            this.X1 = X;
        if (this.X2 < X)
            this.X2 = X;
        if (this.Y1 < Y)
            this.Y1 = Y;
        if (this.Y2 > Y)
            this.Y2 = Y;
    };
    /**
     * 对象转字符串
     */
    ShapeRecordImpl.toStr = function (str) {
        if (!str)
            return null;
        switch (typeof str) {
            case "number":
                return str.toString();
            case "boolean":
                return str ? "1" : "0";
            case "object":
                return str.toString();
            default:
                return str;
        }
    };
    /**
     * 字符串转数组
     */
    ShapeRecordImpl.toArray = function (str) {
        if (!str)
            return null;
        str = ShapeRecordImpl.toStr(str);
        var res = [];
        for (var i = 0; i < str.length; i++)
            res[i] = str.charCodeAt(i);
        return res;
    };
    /**
     * 字符串转 UTF8 编码数组
     */
    ShapeRecordImpl.toUTF8Array = function (str) {
        if (!str)
            return null;
        str = ShapeRecordImpl.toStr(str);
        var utf8 = [];
        for (var i = 0; i < str.length; i++) {
            var charcode = str.charCodeAt(i);
            if (charcode < 0x80)
                utf8.push(charcode);
            else if (charcode < 0x800) {
                utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
            }
            else if (charcode < 0xd800 || charcode >= 0xe000) {
                utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
            }
            else {
                i++;
                charcode =
                    0x10000 + (((charcode & 0x3ff) << 10) | (str.charCodeAt(i) & 0x3ff));
                utf8.push(0xf0 | (charcode >> 18), 0x80 | ((charcode >> 12) & 0x3f), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
            }
        }
        return utf8;
    };
    /**
     * 记录转 DBF 记录
     */
    ShapeRecordImpl.prototype.getDbfRecordArray = function (id, idLen) {
        var rec = new Array(1 /*delMarker*/ + idLen).fill(32);
        var val = ShapeRecordImpl.toArray(id);
        // write fid
        if (val) {
            for (var d = idLen, s = val.length - 1; s >= 0; d--, s--)
                rec[d] = val[s];
        }
        for (var item in this.fileGen.propertyNames) {
            var flen = this.fileGen.propertyLengths[item];
            var f = new Array(flen).fill(32);
            var val_1 = this.properties[item];
            if (val_1) {
                for (var i = 0; i < val_1.length; i++)
                    f[i] = val_1[i];
            }
            rec.push.apply(rec, f);
        }
        return rec;
    };
    /**
     * 记录转 CSV 记录
     */
    ShapeRecordImpl.prototype.getCsvRecordString = function (id) {
        var rec = id.toString();
        for (var item in this.fileGen.propertyNames) {
            var val = ShapeRecordImpl.toStr(this.propertiesOrig[item]);
            if (val) {
                rec += ';"' + val.replace("\\", "\\\\").replace('"', '\\"') + '"';
            }
            else
                rec += ";";
        }
        return rec;
    };
    return ShapeRecordImpl;
}());
/**
 * Shapefile generator base class
 * 该类及其子类收集单个几何类型的所有 ShapeRecord 对象并控制 shape 文件生成
 */
var ESRIFileGenImpl = /** @class */ (function () {
    function ESRIFileGenImpl(geometry, shape) {
        this.records = [];
        this.X1 = 9999;
        this.X2 = -9999;
        this.Y1 = -9999;
        this.Y2 = 9999;
        this.propertyNames = {};
        this.propertyLengths = {};
        this.useCSV = false;
        this.shp = new ArrayBuffer(0);
        this.shpView = new DataView(this.shp);
        this.shx = new ArrayBuffer(0);
        this.shxView = new DataView(this.shx);
        this.dbf = new ArrayBuffer(0);
        this.csv = [];
        this.geometry = geometry;
        this.shape = shape;
    }
    /**
     * 更新文件几何边界
     */
    ESRIFileGenImpl.prototype.checkBounds = function (X, Y) {
        if (this.X1 > X)
            this.X1 = X;
        if (this.X2 < X)
            this.X2 = X;
        if (this.Y1 < Y)
            this.Y1 = Y;
        if (this.Y2 > Y)
            this.Y2 = Y;
    };
    /**
     * 几何处理方法。每个几何类型都有其特定的 process() 方法，由该类的子类实现
     */
    ESRIFileGenImpl.prototype.process = function (item) { };
    /**
     * 目标文件 - 名称
     */
    ESRIFileGenImpl.prototype.getShpName = function () {
        return this.geometry + ".shp";
    };
    ESRIFileGenImpl.prototype.getShxName = function () {
        return this.geometry + ".shx";
    };
    ESRIFileGenImpl.prototype.getDbfName = function () {
        return this.geometry + ".dbf";
    };
    ESRIFileGenImpl.prototype.getCpgName = function () {
        return this.geometry + ".cpg";
    };
    ESRIFileGenImpl.prototype.getCsvName = function () {
        return this.geometry + ".csv";
    };
    ESRIFileGenImpl.prototype.getPrjName = function () {
        return this.geometry + ".prj";
    };
    /**
     * 目标文件 - 大小计算
     */
    ESRIFileGenImpl.prototype.getShxSize = function () {
        return 100 + 8 * this.records.length;
    };
    ESRIFileGenImpl.prototype.getShpSize = function () {
        var _this = this;
        var s = 100;
        this.records.forEach(function (item) {
            s += 8 + _this._getContentLength(item);
        });
        return s;
    };
    /**
     * 目标文件 - 写入器
     */
    ESRIFileGenImpl.prototype.writeShp = function () {
        var _this = this;
        if (this.records.length === 0)
            return;
        var size = this.getShpSize();
        this.shp = new ArrayBuffer(size);
        this.shpView = new DataView(this.shp);
        var offset = 100;
        var id = 1;
        this.records.forEach(function (item) {
            _this.checkBounds(item.X1, item.Y1);
            _this.checkBounds(item.X2, item.Y2);
            _this._writeGeometry(item, _this.shpView, offset, id);
            offset += 8 + _this._getContentLength(item);
            id++;
        });
        this._writeShpxHeader(this.shpView, size);
    };
    ESRIFileGenImpl.prototype.writeShx = function () {
        var _this = this;
        if (this.records.length === 0)
            return;
        var size = this.getShxSize();
        this.shx = new ArrayBuffer(size);
        this.shxView = new DataView(this.shx);
        var offset = 100;
        var ioffset = 100;
        var id = 1;
        this.records.forEach(function (item) {
            _this.shxView.setInt32(0 + offset, ioffset / 2, false); //big record id
            var size = _this._getContentLength(item);
            _this.shxView.setInt32(4 + offset, size / 2, false); //big record id
            ioffset += 8 + size;
            offset += 8;
            id++;
        });
        this._writeShpxHeader(this.shxView, size);
    };
    ESRIFileGenImpl.prototype._writeShpxHeader = function (dataView, size) {
        dataView.setInt32(0, 9994, false); //big
        dataView.setInt32(24, size / 2, false); //filesize - big
        dataView.setInt32(28, 1000, true); //little
        dataView.setInt32(32, this.shape, true); //little
        dataView.setFloat64(36, this.X1, true);
        dataView.setFloat64(44, this.Y2, true);
        dataView.setFloat64(52, this.X2, true);
        dataView.setFloat64(60, this.Y1, true);
    };
    ESRIFileGenImpl.prototype.writeDbf = function () {
        var headerSize = 32;
        var fieldCount = 1;
        var idLen = 0x0b;
        var flen = idLen;
        var recordBytes = flen;
        var h = [
            3, 120, 7, 7, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
            0, 0, 0, 0, 0, 0, 0, 0,
        ];
        var f = [
            0x46,
            0x49,
            0x44,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0x4e,
            0,
            0,
            0,
            0,
            flen,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
        ];
        h = h.concat(f);
        for (var item in this.propertyNames) {
            flen = this.propertyLengths[item];
            f = [
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0x43,
                0,
                0,
                0,
                0,
                flen,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
            ];
            for (var i = 0; i < item.length; i++)
                f[i] = item.charCodeAt(i);
            fieldCount++;
            recordBytes += flen;
            h = h.concat(f);
        }
        headerSize += 32 * fieldCount + 1 /*fieldTerm*/;
        h[headerSize - 1] = 13; /*fieldTerm*/
        var size = headerSize + (1 /*delMarker*/ + recordBytes) * this.records.length;
        this.dbf = new ArrayBuffer(size);
        var array = new Uint8Array(this.dbf);
        array.set(h, 0);
        var dataView = new DataView(this.dbf);
        dataView.setUint32(4, this.records.length, true);
        dataView.setUint16(8, headerSize, true);
        dataView.setUint16(10, recordBytes + 1, true);
        var offset = headerSize;
        var id = 1;
        this.records.forEach(function (record) {
            var rec = record.getDbfRecordArray(id, idLen);
            array.set(rec, offset);
            offset += 1 /*delMarker*/ + recordBytes;
            id++;
        });
    };
    ESRIFileGenImpl.prototype.writeCsv = function () {
        var res = "FID";
        for (var item in this.propertyNames) {
            res += ";" + item;
        }
        var id = 1;
        this.records.forEach(function (record) {
            var rec = record.getCsvRecordString(id);
            res += "\n" + rec;
            id++;
        });
        var utf8Array = ShapeRecordImpl.toUTF8Array(res);
        this.csv = [0xef, 0xbb, 0xbf].concat(utf8Array || []);
    };
    ESRIFileGenImpl.prototype._writeGeometry = function (rec, shpView, offset, id) { };
    ESRIFileGenImpl.prototype._getContentLength = function (rec) {
        return 0;
    };
    return ESRIFileGenImpl;
}());
/**
 * Shapefile generators implementing all GeoJSON geometries
 */
var PointFileGen = /** @class */ (function (_super) {
    __extends(PointFileGen, _super);
    function PointFileGen() {
        return _super.call(this, "Point", 1) || this;
    }
    PointFileGen.prototype.process = function (item) {
        var g = item.geometry.coordinates;
        this.checkBounds(g[0], g[1]);
        var rec = new ShapeRecordImpl(this, item);
        rec.checkBounds(g[0], g[1]);
        rec.points.push(g[0], g[1]);
    };
    PointFileGen.prototype._writeGeometry = function (rec, shpView, offset, id) {
        GeoJson2Shaper.writePointGeometry(rec, shpView, offset, id);
    };
    PointFileGen.prototype._getContentLength = function (rec) {
        return GeoJson2Shaper.getPointContentLength(rec);
    };
    return PointFileGen;
}(ESRIFileGenImpl));
var LineStringFileGen = /** @class */ (function (_super) {
    __extends(LineStringFileGen, _super);
    function LineStringFileGen() {
        return _super.call(this, "LineString", 3) || this;
    }
    LineStringFileGen.prototype.process = function (item) {
        var g = item.geometry.coordinates;
        var rec = new ShapeRecordImpl(this, item);
        rec.partIndices[rec.partCount++] = rec.points.length / 2;
        g.forEach(function (coord) {
            rec.checkBounds(coord[0], coord[1]);
            rec.points.push(coord[0], coord[1]);
        });
    };
    LineStringFileGen.prototype._writeGeometry = function (rec, shpView, offset, id) {
        GeoJson2Shaper.writePolygonGeometry(rec, shpView, offset, id);
    };
    LineStringFileGen.prototype._getContentLength = function (rec) {
        return GeoJson2Shaper.getPolygonContentLength(rec);
    };
    return LineStringFileGen;
}(ESRIFileGenImpl));
var PolygonFileGen = /** @class */ (function (_super) {
    __extends(PolygonFileGen, _super);
    function PolygonFileGen() {
        return _super.call(this, "Polygon", 5) || this;
    }
    PolygonFileGen.prototype.process = function (item) {
        var g = item.geometry.coordinates;
        var rec = new ShapeRecordImpl(this, item);
        g.forEach(function (ring) {
            rec.partIndices[rec.partCount++] = rec.points.length / 2;
            ring.forEach(function (coord) {
                rec.checkBounds(coord[0], coord[1]);
                rec.points.push(coord[0], coord[1]);
            });
        });
    };
    PolygonFileGen.prototype._writeGeometry = function (rec, shpView, offset, id) {
        GeoJson2Shaper.writePolygonGeometry(rec, shpView, offset, id);
    };
    PolygonFileGen.prototype._getContentLength = function (rec) {
        return GeoJson2Shaper.getPolygonContentLength(rec);
    };
    return PolygonFileGen;
}(ESRIFileGenImpl));
var MultiPointFileGen = /** @class */ (function (_super) {
    __extends(MultiPointFileGen, _super);
    function MultiPointFileGen() {
        return _super.call(this, "MultiPoint", 8) || this;
    }
    MultiPointFileGen.prototype.process = function (item) {
        var g = item.geometry.coordinates;
        var rec = new ShapeRecordImpl(this, item);
        g.forEach(function (coord) {
            rec.checkBounds(coord[0], coord[1]);
            rec.points.push(coord[0], coord[1]);
        });
    };
    MultiPointFileGen.prototype._writeGeometry = function (rec, shpView, offset, id) {
        GeoJson2Shaper.writeMultiPointGeometry(rec, shpView, offset, id);
    };
    MultiPointFileGen.prototype._getContentLength = function (rec) {
        return GeoJson2Shaper.getMultiPointContentLength(rec);
    };
    return MultiPointFileGen;
}(ESRIFileGenImpl));
var MultiLineStringFileGen = /** @class */ (function (_super) {
    __extends(MultiLineStringFileGen, _super);
    function MultiLineStringFileGen() {
        return _super.call(this, "MultiLineString", 3) || this;
    }
    MultiLineStringFileGen.prototype.process = function (item) {
        var g = item.geometry.coordinates;
        var rec = new ShapeRecordImpl(this, item);
        g.forEach(function (line) {
            rec.partIndices[rec.partCount++] = rec.points.length / 2;
            line.forEach(function (coord) {
                rec.checkBounds(coord[0], coord[1]);
                rec.points.push(coord[0], coord[1]);
            });
        });
    };
    MultiLineStringFileGen.prototype._writeGeometry = function (rec, shpView, offset, id) {
        GeoJson2Shaper.writePolygonGeometry(rec, shpView, offset, id);
    };
    MultiLineStringFileGen.prototype._getContentLength = function (rec) {
        return GeoJson2Shaper.getPolygonContentLength(rec);
    };
    return MultiLineStringFileGen;
}(ESRIFileGenImpl));
var MultiPolygonFileGen = /** @class */ (function (_super) {
    __extends(MultiPolygonFileGen, _super);
    function MultiPolygonFileGen() {
        return _super.call(this, "MultiPolygon", 5) || this;
    }
    MultiPolygonFileGen.prototype.process = function (item) {
        var g = item.geometry.coordinates;
        var rec = new ShapeRecordImpl(this, item);
        g.forEach(function (polygon) {
            polygon.forEach(function (ring) {
                rec.partIndices[rec.partCount++] = rec.points.length / 2;
                ring.forEach(function (coord) {
                    rec.checkBounds(coord[0], coord[1]);
                    rec.points.push(coord[0], coord[1]);
                });
            });
        });
    };
    MultiPolygonFileGen.prototype._writeGeometry = function (rec, shpView, offset, id) {
        GeoJson2Shaper.writePolygonGeometry(rec, shpView, offset, id);
    };
    MultiPolygonFileGen.prototype._getContentLength = function (rec) {
        return GeoJson2Shaper.getPolygonContentLength(rec);
    };
    return MultiPolygonFileGen;
}(ESRIFileGenImpl));
